from base_annotation import BaseProcessor
from elasticsearch import Elasticsearch
import os
import time
from typing import List
import numpy as np
from utils import get_rawfile
from abc import ABC, abstractmethod
import tiktoken
import re
import subprocess
from pathlib import Path
from openai.embeddings_utils import get_embeddings
from settings import settings

es_url = settings.ELASTICSEARCH_URL
es = Elasticsearch(es_url)


PARAGRAPHS_INDEX = "paragraphs"


class Embedder(ABC):
    """abstract class for embedding a list of paragraphs into a matrix"""
    @abstractmethod
    def embed_paragraphs(self, paragraphs: List[str]) -> np.ndarray: ...


class Extractor(ABC):
    """abstract class for extracting text from a pdf file and splitting into paragraphs"""
    @abstractmethod
    def extract_pdf_text(self, path: Path) -> str: ...

    @abstractmethod
    def convert_to_paragraphs(self, text: str) -> List[str]: ...


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


class NougatExtractor(Extractor):
    def __init__(self, batch_size: int = 4, min_words: int = 25):
        """
        Extract text from a pdf file using nougat-ocr.

        Args:
            batch_size (int, optional): batch size for nougat-ocr. Defaults to 4.
            min_words (int, optional): minimum number of words for a paragraph to be included in the output. Defaults to 25.
        """
        self.batch_size = batch_size
        self.min_words = min_words

    def extract_pdf_text(self, path: Path, log = None) -> str:
        """
        extract text from a pdf file using nougat-ocr

        Args:
            path (Path): path to the pdf file
            log (_FILE, optional): file object to write stdout and stderr to. Defaults to None (i.e. output to stdout/stderr).
        """
        assert path.exists(), f"file {path} does not exist"
        assert path.suffix == '.pdf', f"file {path} is not a pdf"
        result = subprocess.run(['nougat', str(path), '-o', str(path.parent), '-b', str(self.batch_size)], stdout=log, stderr=log)
        assert result.returncode == 0, f"error extracting text from {path}"
        text = path.with_suffix('.mmd').read_text()
        path.with_suffix('.mmd').unlink()
        return text

    def convert_to_paragraphs(self, text: str) -> List[str]:
        """break a string into paragraphs, filtering out ones that should not be used for semantic search"""
        paragraph_filter = lambda p: not NougatExtractor.is_too_short(p, self.min_words) and not NougatExtractor.is_citation(p)
        paragraphs = list(filter(paragraph_filter, text.split('\n\n')))
        return paragraphs

    @staticmethod
    def is_too_short(paragraph: str, min_words: int) -> bool:
        """paragraph filter for checking if a paragraph is too short (by word count)"""
        return len(paragraph.split()) < min_words

    @staticmethod
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
extractor = NougatExtractor(batch_size=BATCH_SIZE)
embedder = AdaEmbedder()


class ParagraphProcessor(BaseProcessor):
    @staticmethod
    def run(document_id, s3_url, context={}):
        """
        Processes PDF: extracts text and calculates embeddings, then stores
        results to elasticsearch
        """
        # 1. Download pdf from S3
        raw_file = get_rawfile(path=s3_url)

        # 2 save file to disk
        location = "/documents"
        if not os.path.exists(location):
            os.makedirs(location)

        new_file_path = os.path.join(location, f"{document_id}.pdf")

        with open(new_file_path, "wb") as output_file:
            output_file.write(raw_file.read())
            output_file.close()

        # 2. Extract text for pdf using local path from download above
        text = extractor.extract_pdf_text(Path(new_file_path))
        paragraphs = extractor.convert_to_paragraphs(text)

        embeddings = embedder.embed_paragraphs(paragraphs)

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
    Context should include a full_indicator indicator dictionary (see
    elasticsearch for examples) and an indicator_id (uuid).
    """
    document_id = context["document_id"]
    s3_url = context["s3_url"]

    processor = ParagraphProcessor()
    result = processor.run(document_id, s3_url)

    return result
