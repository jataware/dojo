#!/usr/bin/env python

import sys,os
from pathlib import Path
import argparse
from elasticsearch import Elasticsearch

sys.path.append(str(Path(__file__).resolve().parent.parent))

from dart_papers import DartPapers
from src.search.bert_search import BertSentenceSearch

parser = argparse.ArgumentParser("Parse indicators and upload features to elasticsearch.")
parser.add_argument("--es-host",
                    help="Elasticsearch host",
                    type=str, default="localhost:9200")

cli_args = parser.parse_args()

es = Elasticsearch(f"http://{cli_args.es_host}")

print(es.info())

paragraph_corpus = DartPapers.get_paragraph_corpus()
engine = BertSentenceSearch(paragraph_corpus, cuda=False)


# Index all paragraphs to elasticsearch
for key, embedding in engine:

    document_id, paragraph_index = key # second parameter is paragraph index

    paragraph = paragraph_corpus[key]

    p_id = f"{document_id}-{paragraph_index}"

    print(f"Paragraph id: {p_id}")

    es.index(index="document_paragraphs",
             body={
                 "text": paragraph,
                 "document_id": document_id,
                 "embeddings": embedding.tolist()
             },
             id=p_id)
