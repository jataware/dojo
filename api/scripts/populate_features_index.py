#!/usr/bin/env python

"""
Script to populate features index from the indicators index. Useful when first
adding dataset/feature semantic search to a clean es/instance. Can be used
as a one-off script, or derive a tool in case indicators and features ever get
out of sync.
"""

import sys
from pathlib import Path
import argparse

sys.path.append(str(Path(__file__).resolve().parent.parent))

from src.embedder_engine import embedder
from elasticsearch import Elasticsearch

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

    # Accepts a list for flexibility, and returns corresponsing embeddings list
    # We only pass one input, so we retrieve the first and only output
    return embedder.embed([description])[0]


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
        feature_id = f"{indicator_id}-{output['name']}";
        es.index(index="features", body=feature, id=feature_id)


es_body = {
    "query": {
        "match_all": {}
    }
}


def parse_indicators(hits, total_processed):
    print(f"This page found {len(hits)} indicator hits.")

    for idx, indicator in enumerate(hits):
        one_match = indicator["_source"]
        indicator_id = one_match["id"]

        print(f"total: {total_processed} idx: {idx}, Processing indicator id: {indicator_id}\n")

        saveAllOutputEmbeddings(one_match, indicator_id)
        total_processed += 1

    return total_processed



def process_upload_indicators():
    """
    """
    print("Called process_upload_indicators\n")

    total_processed = 0
    PAGE_SIZE = 20

    results = es.search(index="indicators", body=es_body, scroll="2m", size=PAGE_SIZE)

    hits = results["hits"]["hits"]

    if len(hits):
        total_processed = parse_indicators(hits, total_processed)

    scroll_id = results["_scroll_id"]

    print(f"scroll id: {scroll_id}\n")

    while bool(scroll_id) and len(hits) >= PAGE_SIZE:
        print("There are more results\n")

        # new results
        results = es.scroll(scroll_id=scroll_id, scroll="2m")
        hits = results["hits"]["hits"]
        scroll_id = results["_scroll_id"]

        if len(hits):
            total_processed = parse_indicators(hits, total_processed)


if __name__ == "__main__":
    process_upload_indicators()
    exit(0)

