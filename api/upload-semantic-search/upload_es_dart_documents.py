#!/usr/bin/env python

import sys,os
from pathlib import Path
import argparse
from elasticsearch import Elasticsearch

sys.path.append(str(Path(__file__).resolve().parent.parent))

from dart_papers import DartPapers

parser = argparse.ArgumentParser("Parse indicators and upload features to elasticsearch.")
parser.add_argument("--es-host",
                    help="Elasticsearch host",
                    type=str, default="localhost:9200")

cli_args = parser.parse_args()

es = Elasticsearch(f"http://{cli_args.es_host}")

print(es.info())

document_metadata = DartPapers.get_metadata()

def index_all_documents():
    """
    Loops through Dart Document metadata in the corpus and uploads to elasticsearch `documents`.
    """
    parsedCount = 1

    for id, metadata in document_metadata.items():
        print(f"{parsedCount} Processing document id: {id}")
        es.index(index="documents", body=metadata, id=id)
        parsedCount += 1


if __name__ == "__main__":
    index_all_documents()
    exit(0)

