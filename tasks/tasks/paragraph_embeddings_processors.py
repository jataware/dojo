from base_annotation import BaseProcessor
from elasticsearch import Elasticsearch
import time
import os
from typing import List, Tuple
import numpy as np
from utils import get_rawfile
from jatarag.embedder import AdaEmbedder
from jatarag.extractor import NougatExtractor
from settings import settings
from pypdf import PdfReader
import ocrmypdf

# import logging
# logging.basicConfig()
# logging.getLogger().setLevel(logging.INFO)
es_url = settings.ELASTICSEARCH_URL
es = Elasticsearch(es_url)


PARAGRAPHS_INDEX = "document_paragraphs"


def current_milli_time():
    return round(time.time() * 1000)


# extractor is only used to convert text to paragraphs. actual extraction is done elsewhere
extractor = NougatExtractor()
embedder = AdaEmbedder()


class ParagraphProcessor(BaseProcessor):
    @staticmethod
    def run(document_id, s3_key, context={}):
        """
        Processes PDF: Downloads extractions, calculates embeddings, and stores
        results to elasticsearch
        """
        # 1. Download mmd from S3
        mmd_s3_url = f"{settings.DOCUMENT_STORAGE_BASE_URL}{s3_key}"
        # logging.debug(f"Getting file at key: {mmd_s3_url}")
        raw_file = get_rawfile(path=mmd_s3_url)

        # 2. Extract text for pdf using local path from download above
        # logging.debug("Reading text and converting to paragraphs")

        text = raw_file.read()
        text = text.decode()
        paragraphs = extractor.convert_to_paragraphs(text)

        # logging.debug(f"Embedding all Ps. First p: {paragraphs[0]}")
        embeddings = embedder.embed_paragraphs(paragraphs)

        # logging.debug("Uploading to es.")
        # 3. For each paragraph, calculate embeddings and index text + embedding
        for p_no, text in enumerate(paragraphs):
            p_body = {
                "text": text,
                "embeddings": embeddings[p_no],
                "document_id": document_id,
                "length": len(text),
                "index": p_no,
                "page_no": None  # does external extractor provide page_no?
            }

            # TODO bulk prepare and bulk upload to speed up processing
            es.index(index=PARAGRAPHS_INDEX, body=p_body, id=f"{document_id}-{p_no}")

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
    Context should include a document dictionary (see
    elasticsearch for examples) and an document_id (uuid).
    """
    document_id = context["document_id"]
    s3_key = context["s3_key"]

    # logging.debug("Calculate store embeddings:")
    # logging.debug(document_id)
    # logging.debug(s3_key)

    processor = ParagraphProcessor()
    result = processor.run(document_id, s3_key)

    return result


def extract_text(path: str) -> List[Tuple[str, int]]:
    """
    Local OCR/text extractor, as backup when external OCR not available.
    """
    work_path = 'tmp.pdf'
    ocrmypdf.ocr(path, work_path, language='eng', progress_bar=False, redo_ocr=True, sidecar='tmp.txt')
    reader = PdfReader(work_path)
    pages = [page.extract_text() for page in reader.pages]

    # create a map from the line number to the page number
    num_lines = np.array([len(page.splitlines()) for page in pages] + [float(9999999)])  # lines on each page
    cumulative_line_counts = np.cumsum(num_lines)  # line number to page number
    def line_to_page(line_num): return np.argmax(cumulative_line_counts >= line_num)

    text = '\n'.join(pages)

    # Combine any adjacent lines with more than 5 words (hacky way to combine paragraphs)
    lines = text.splitlines()
    paragraphs = []
    paragraph = []
    for line_number, line in enumerate(lines):
        page_number = line_to_page(line_number)
        line = line.strip()
        if 5 < len(line.split()):  # < 50: # if the line has more than 5 words, but less than 100, it's probably a line of a larger paragraph
            paragraph.append((line, page_number))
        else:
            paragraph = [p for p in paragraph if p[0]]  # filter out empty strings
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

    # Take the smallest page number from the pages that the paragraph is on
    paragraphs = [(paragraph, min(pages)) for paragraph, pages in paragraphs]

    return paragraphs


def full_document_process(context):
    document_id = context["document_id"]
    s3_url = context["s3_url"]

    """
    Processes PDF: extracts text and calculates embeddings, then stores
    results to elasticsearch
    """
    # 1. Download pdf from S3
    raw_file = get_rawfile(path=s3_url)

    # 2 save file to disk...
    location = f"/documents"
    if not os.path.exists(location):
        os.makedirs(location)

    new_file_path = os.path.join(location, f"{document_id}.pdf")

    with open(new_file_path, "wb") as output_file:
        output_file.write(raw_file.read())

    # 2. Extract text for pdf using local path from download above
    paragraphs = extract_text(new_file_path)

    # 3. For each paragraph, calculate embeddings and index text + embedding
    for i, (text, p_no) in enumerate(paragraphs):
        p_body = {
            "text": text,
            "embeddings": embedder.embed_paragraphs([text])[0],
            "document_id": document_id,
            "length": len(text),
            "index": i,
            "page_no": p_no + 1  # indexes at 0, pdf pages make more sense starting from 1
        }

        # TODO bulk prepare and bulk upload to speed up processing

        es.index(index=PARAGRAPHS_INDEX, body=p_body, id=f"{document_id}-{i}")

    # 4. Updated processed_at time on document
    es.update(index="documents", body={
        "doc": {
            "processed_at": current_milli_time()
        }
    }, id=document_id)

    # 5. Return result/success
    return True
