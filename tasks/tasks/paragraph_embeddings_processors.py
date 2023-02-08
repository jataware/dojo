import logging
from base_annotation import BaseProcessor
from elasticsearch import Elasticsearch

import os
from glob import glob
from pypdf import PdfReader
import ocrmypdf
from typing import Generator
import numpy as np
import torch
from sentence_transformers import SentenceTransformer
# from transformers import logging
import pdb

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)

es_url = os.environ.get("ELASTICSEARCH_URL", "http://localhost:9200")
es = Elasticsearch(es_url)



def extract_text(path: str) -> list[tuple[str, int]]:
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
        if 5 < len(line.split()):# < 50: # if the line has more than 5 words, but less than 100, it's probably a line of a larger paragraph
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
    def __init__(self, *, model='all-mpnet-base-v2', cuda=True, batch_size=32):

        self.batch_size = batch_size
        #create an instance of the model, and optionally move it to GPU
        with torch.no_grad():
            # logging.set_verbosity_error()
            self.model = SentenceTransformer(model)
            if cuda:
                self.model = self.model.cuda()

    def embed(self, sentences: list[str]) -> list[np.ndarray]:
        """
        embed a list of sentences
        """
        with torch.no_grad():
            embeddings = self.model.encode(sentences, batch_size=self.batch_size, show_progress_bar=False)
        embeddings = [e for e in embeddings] #convert to list
        return embeddings



# authors_blacklist = {
#     'user',
#     'utente di', #`user of` in italian
#     'microsoft',
#     'office',
#     # 'BANTIV', #what is this?
#     'adobe',
#     'acrobat',
# }

# def is_blacklisted_author(author: str) -> bool:
#     """check if an author string is made up of blacklisted words (indicating no actual author given)"""
#     if not author:
#         return True
#     if any([a.strip() in authors_blacklist for a in author.lower().split()]):
#         return True
#     return False



class EmbeddingsProcessor(BaseProcessor):
    @staticmethod
    def run(document_id, s3_url, context={}):
        """
        Processes PDF: extracts text and caluclates embeddings, then stores
        results to elasticsearch
        """
        # TODO
        # 1. Download pdf from S3
        # 2. Extract text for pdf using local path from download above
        # 3. For each paragraph, calculate embeddings and:
        # 4. Store text + embedding to es for each Paragraph
        # 5. Return result/success

        # result = save_paragraph_with_embeddings(document_id, text, embedding)

        # return result["result"]


# def calculate_store_embeddings(context):
#     """
#     Context should include a full_indicator indicator dictionary (see
#     elasticsearch for examples) and an indicator_id (uuid).
#     """
#     indicator_id = context["indicator_id"]
#     full_indicator = context["full_indicator"]

#     print(f"Starting embeddings job for indicator: {indicator_id}\n")

#     embedder = EmbeddingsProcessor()
#     result = embedder.run(indicator_data={"body": full_indicator, "id": indicator_id})

#     print(f"Job result for indicator {indicator_id}: {result}\n")

#     return result


# print("Starting Paragraph Embedder Engine")
