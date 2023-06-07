#!/usr/bin/env python

# from pathlib import Path # Maybe use in the future.
import argparse
from elasticsearch import Elasticsearch

import time
import re

from .dart_papers import DartPapers

parser = argparse.ArgumentParser("Parse indicators and upload features to elasticsearch.")
parser.add_argument("--es-host",
                    help="Elasticsearch host",
                    type=str, default="localhost:9200")

cli_args = parser.parse_args()

es = Elasticsearch(f"http://{cli_args.es_host}")

print(es.info())

document_metadata = DartPapers.get_metadata()


def current_milli_time():
    return round(time.time() * 1000)


def camel_to_snake(str):
    """Receives a lowercase, snake_case, camelCase, or PascalCase input string
    and returns it as snake_case. In the case of snake_case input, no
    transformation occurs.
    """
    return re.sub(r'(?<!^)(?=[A-Z])', '_', str).lower()


def dict_to_snake_case(a_dict):
    return {camel_to_snake(k): v for k, v in a_dict.items()}

DEFAULT_DOC = {
    "creation_date": None,
    "mod_date": None,
    "type": "article",
    "description": "",
    "original_language": "",
    "classification": "UNCLASSIFIED",
    "title": "",
    "producer": "",
    "stated_genre": "",
    "uploaded_at": None,
    "processed_at": None
}

def index_all_documents():
    """
    Loops through Dart Document metadata in the corpus and uploads to elasticsearch `documents`.
    """
    parsedCount = 1

    for id, metadata in document_metadata.items():
        print(f"{parsedCount} Processing document id: {id}")

        es.index(index="documents",
                 body=DEFAULT_DOC|dict_to_snake_case(metadata)|{"processed_at": current_milli_time(), "uploaded_at": None},
                 id=id)
        parsedCount += 1


if __name__ == "__main__":
    index_all_documents()
    exit(0)
