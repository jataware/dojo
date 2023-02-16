from operator import length_hint
from base_annotation import BaseProcessor
from elasticsearch import Elasticsearch

import os
from glob import glob
import time
from pypdf import PdfReader
import ocrmypdf
from typing import Generator, List, Tuple
import numpy as np
import torch
from utils import get_rawfile, put_rawfile
from sentence_transformers import SentenceTransformer
from transformers import logging


es_url = os.environ.get("ELASTICSEARCH_URL", "http://localhost:9200")
es = Elasticsearch(es_url)


def extract_text(path: str) -> List[Tuple[str, int]]:
    work_path = 'tmp.pdf'
    ocrmypdf.ocr(path, work_path, language='eng', progress_bar=False, redo_ocr=True, sidecar='tmp.txt')
    reader = PdfReader(work_path)
    pages = [page.extract_text() for page in reader.pages]

    #create a map from the line number to the page number
    num_lines = np.array([len(page.splitlines()) for page in pages] + [float(9999999)]) # lines on each page
    cumulative_line_counts = np.cumsum(num_lines) # line number to page number
    line_to_page = lambda line_num: np.argmax(cumulative_line_counts >= line_num)

    text = '\n'.join(pages)

    #combine any adjacent lines with more than 5 words (hacky way to combine paragraphs)
    lines = text.splitlines()
    paragraphs = []
    paragraph = []
    for line_number, line in enumerate(lines):
        page_number = line_to_page(line_number)
        line = line.strip()
        if 5 < len(line.split()): # < 50: # if the line has more than 5 words, but less than 100, it's probably a line of a larger paragraph
            paragraph.append((line, page_number))
        else:
            paragraph = [p for p in paragraph if p[0]] # filter out empty strings
            paragraph_txt = ' '.join([p[0] for p in paragraph])
            paragraph_pages = {p[1] for p in paragraph}
            if paragraph_txt:
                paragraphs.append((paragraph_txt, paragraph_pages))
            if line:
                paragraphs.append((line, {page_number}))
            paragraph = []

    if paragraph:
        paragraph_txt = ' '.join([p[0] for p in paragraph])
        paragraph_pages = {p[1] for p in paragraph}
        if paragraph_txt:
            paragraphs.append((paragraph_txt, paragraph_pages))


    #take the smallest page number from the pages that the paragraph is on
    paragraphs = [(paragraph, min(pages)) for paragraph, pages in paragraphs]

    return paragraphs


class Embedder:
    """
    Convert a list of strings to embeddings
    Example:
    ```
    model = Embedder(cuda=True)
    sentences = ['this is a sentence', 'this is another sentence', 'this is a third sentence']
    embeddings = model.embed(sentences)
    ```
    """
    def __init__(self, *, model='all-mpnet-base-v2', cuda=False, batch_size=32):

        self.batch_size = batch_size
        #create an instance of the model, and optionally move it to GPU
        with torch.no_grad():
            logging.set_verbosity_debug()
            self.model = SentenceTransformer(model)
            if cuda:
                self.model = self.model.cuda()

    def embed(self, sentences: List[str]) -> List[np.ndarray]:
        """
        embed a list of sentences
        """
        with torch.no_grad():
            embeddings = self.model.encode(sentences, batch_size=self.batch_size, show_progress_bar=False)
        embeddings = [e for e in embeddings] # convert to list
        return embeddings


model = Embedder()


def current_milli_time():
    return round(time.time() * 1000)

class ParagraphProcessor(BaseProcessor):
    @staticmethod
    def run(document_id, s3_url, context={}):
        """
        Processes PDF: extracts text and caluclates embeddings, then stores
        results to elasticsearch
        """
        # 1. Download pdf from S3
        raw_file = get_rawfile(path=s3_url)

        # 2 save file to disk... TODO: check if we can use the pdf lib with raw binary file instead
        location = f"/documents"
        if not os.path.exists(location):
            os.makedirs(location)

        new_file_path = os.path.join(location, f"{document_id}.pdf")

        with open(new_file_path, "wb") as output_file:
            output_file.write(raw_file.read())

        # 2. Extract text for pdf using local path from download above
        paragraphs = extract_text(new_file_path)

        # 3. For each paragraph, calculate embeddings and index text + embedding
        i = 0
        for text, p_no in paragraphs:
            p_body = {
                "text": text,
                "embeddings": model.embed([text])[0],
                "document_id": document_id,
                "length": len(text),
                "page_no": p_no + 1 # indexes at 0, pdf pages make more sense starting from 1
            }

            es.index(index="document_paragraphs", body=p_body, id=f"{document_id}-{i}")
            i += 1

        # 4. Updated processed_at time on document
        es.update(index="documents", body={
            "doc": {
                "processed_at": current_milli_time()
            }
        }, id=document_id)

        # 5. Return result/success
        return True


def calculate_store_embeddings(context):
    """
    Context should include a full_indicator indicator dictionary (see
    elasticsearch for examples) and an indicator_id (uuid).
    """
    document_id = context["document_id"]
    s3_url = context["s3_url"]

    processor = ParagraphProcessor()
    result = processor.run(document_id, s3_url)

    return result
