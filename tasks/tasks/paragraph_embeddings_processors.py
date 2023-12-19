from base_annotation import BaseProcessor
from elasticsearch import Elasticsearch
import time
from typing import List
import numpy as np
from utils import get_rawfile
from abc import ABC, abstractmethod
import tiktoken
import re
from openai.embeddings_utils import get_embeddings
from settings import settings

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)

es_url = settings.ELASTICSEARCH_URL
es = Elasticsearch(es_url)


PARAGRAPHS_INDEX = "paragraphs"


class Embedder(ABC):
    """abstract class for embedding a list of paragraphs into a matrix"""
    @abstractmethod
    def embed_paragraphs(self, paragraphs: List[str]) -> np.ndarray: ...


class AdaEmbedder(Embedder):
    def __init__(self):
        self.max_tokens = 8192
        self.num_feature = 1536
        self.tokenizer = tiktoken.encoding_for_model("text-embedding-ada-002")

    def embed_paragraphs(self, paragraphs: List[str]) -> np.ndarray:
        """embed a list of paragraphs into a list of vectors. Output size is (num_paragraphs, num_features)"""

        # before embedding, truncate any paragraphs that are too many tokens
        truncated_paragraphs = [self.tokenizer.decode(self.tokenizer.encode(p)[:self.max_tokens]) for p in paragraphs]

        if len(truncated_paragraphs) == 0:
            paragraph_embeddings = np.zeros((0, self.num_feature))
        else:
            paragraph_embeddings = np.array(get_embeddings(truncated_paragraphs, engine="text-embedding-ada-002"))

        return paragraph_embeddings


MIN_WORDS = 25


def convert_to_paragraphs(text: str) -> List[str]:
    """break a string into paragraphs, filtering out ones that should not be used for semantic search"""
    paragraph_filter = lambda p: not is_too_short(p, MIN_WORDS) and not is_citation(p)
    paragraphs = list(filter(paragraph_filter, text.split('\n\n')))
    return paragraphs


def is_too_short(paragraph: str, min_words: int) -> bool:
    """paragraph filter for checking if a paragraph is too short (by word count)"""
    return len(paragraph.split()) < min_words


def is_citation(paragraph: str) -> bool:
    """paragraph filter for checking if a paragraph is a citation section"""
    patterns = [
        r"\*.*\(\d{4}\).*:.*\.",
        r"\*\s\[[^\]]+\d{4}\].*\.",
        r"\*\s\[[^\]]*\][^(\d{4})]*\d{4}.*",
        r"\*\s.*\d{4}.*\.\s(?:http|www)\S+",
        r"\*.*\d{4}\.\s[_\*]?[A-Za-z0-9][^\*]*?[_\*]?\.\s.*?\.",
    ]
    pattern = f'({")|(".join(patterns)})'
    lines = paragraph.split('\n')

    # count the number of lines that match the pattern
    num_matches = sum([1 for line in lines if re.match(pattern, line)])

    return num_matches > len(lines)/2


def current_milli_time():
    return round(time.time() * 1000)


BATCH_SIZE = 2
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
        logging.info(f"Getting file at key: {mmd_s3_url}")
        raw_file = get_rawfile(path=mmd_s3_url)

        # 2. Extract text for pdf using local path from download above
        logging.info("Reading text and converting to paragraphs")

        text = raw_file.read()
        text = text.decode()
        paragraphs = convert_to_paragraphs(text)

        logging.info(f"Embedding all Ps. First p: {paragraphs[0]}")
        embeddings = embedder.embed_paragraphs(paragraphs)

        logging.info("Uploading to es.")
        # 3. For each paragraph, calculate embeddings and index text + embedding
        for p_no, text in enumerate(paragraphs):
            p_body = {
                "text": text,
                "embeddings": embeddings[p_no],
                "document_id": document_id,
                "length": len(text),
                "index": p_no,
                "page_no": p_no + 1  # indexes at 0, pdf pages make more sense starting from 1
            }

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

    logging.info("Calculate store embeddings:")
    logging.info(document_id)
    logging.info(s3_key)

    processor = ParagraphProcessor()
    result = processor.run(document_id, s3_key)

    return result
