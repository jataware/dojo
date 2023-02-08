#!/usr/bin/env python

import sys,os
from pathlib import Path
import argparse

import uuid

sys.path.append(str(Path(__file__).resolve().parent.parent))

from src.search.bert_search import BertSentenceSearch
from elasticsearch import Elasticsearch
from src.datasearch.corpora import Corpus

parser = argparse.ArgumentParser("Parse indicators and upload features to elasticsearch.")
parser.add_argument("--es-host",
                    help="Elasticsearch host",
                    type=str, default="localhost:9200")

parser.add_argument("--use-gpu",
                    help="Flag to use gpu. Default to false (uses cpu instead).",
                    type=bool, default=False)

args = parser.parse_args()

es = Elasticsearch(f"http://{args.es_host}")

print(es.info())

corpus = Corpus.from_list(["a"])
engine = BertSentenceSearch(corpus, cuda=args.use_gpu)

def calcOutputEmbeddings(output):
    """
    Embeddings are created from a subset of the output properties:
    - name, display_name, description, unit, unit_description.
    """
    description = \
        f"""name: {output['name']};
        display name: {output['display_name']};
        description: {output['description']};
        unit: {output['unit']};
        unit description: {output['unit_description']};"""

    return engine.embed_query(description).tolist()


def saveAllOutputEmbeddings(indicatorDictionary, indicator_id):
    """
    Saves all outputs within an indicator to elasticsearch,
    including the LLM embeddings to use in search.
    """
    for index, output in enumerate(indicatorDictionary["outputs"]):
        feature = {
            **output,
            "embeddings": calcOutputEmbeddings(output),
            "owner_dataset": {
                "id": indicator_id,
                "name": indicatorDictionary["name"]
            }
        }
        feature_id = str(uuid.uuid4())
        es.index(index="features", body=feature, id=feature_id)


es_body = {
    "query": {
        "match_all": {}
    }
}

total_processed = 0

def parse_indicators(hits):
    global total_processed

    print(f"This page found {len(hits)} indicator hits.")

    for idx, indicator in enumerate(hits):
        one_match = indicator["_source"]
        indicator_id = one_match["id"]
        print(f"total: {total_processed} idx: {idx}, Processing indicator id: {indicator_id}\n")
        saveAllOutputEmbeddings(one_match, indicator_id)
        total_processed += 1


SIZE = 10


def process_upload_indicators():
    """
    """
    print("In process_upload_indicators\n")

    results = es.search(index="indicators", body=es_body, scroll="2m", size=SIZE)

    hits = results["hits"]["hits"]

    if len(hits):
        parse_indicators(hits)

    scroll_id = results["_scroll_id"]

    print(f"scroll id: {scroll_id}\n")

    while bool(scroll_id) and len(hits) >= SIZE:
        print("There are more results\n")

        # new results
        results = es.scroll(scroll_id=scroll_id, scroll="2m")
        hits = results["hits"]["hits"]
        scroll_id = results["_scroll_id"]

        if len(hits):
            parse_indicators(hits)


if __name__ == "__main__":
    process_upload_indicators()
    exit(0)
