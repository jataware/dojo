#!/usr/bin/env python

"""
Script verifies how many dataset.outputs are missing in features index, as well
as checks for duplicate features index duplicates (shouldn't occur).
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

args = parser.parse_args()

es = Elasticsearch(f"http://{args.es_host}")

print(es.info())


total_processed = 0 # indicators
# For outputs:
total_missing = 0
total_dups = 0


def compareOutputsToFeatures(indicatorDictionary, indicator_id):
    global total_missing
    global total_dups

    for index, output in enumerate(indicatorDictionary["outputs"]):

        print(f"Processing output#{index}")

        feature_id = f"{indicator_id}-{output['name']}";
        body = {
            "query": {
                "match": {"_id": feature_id}
            }
        }
        res = es.search(index="features", body=body)

        total_found = res["hits"]["total"]["value"]

        if total_found == 0:
            total_missing += 1
        elif total_found > 1:
            total_dups += 1



def parse_indicators(hits):
    global total_processed

    print(f"This page found {len(hits)} indicator hits.")

    for idx, indicator in enumerate(hits):
        one_match = indicator["_source"]
        indicator_id = one_match["id"]
        print(f"Indicators parsed: {total_processed}.\nProcessing indicator id: {indicator_id}\n")
        compareOutputsToFeatures(one_match, indicator_id)
        total_processed += 1


SIZE = 10

def process_indicators():
    """
    """
    global total_missing
    global total_dups

    print("Called process_upload_indicators\n")

    all_indicators = {
        "query": {
            "match_all": {}
        }
    }

    results = es.search(index="indicators", body=all_indicators, scroll="2m", size=SIZE)

    hits = results["hits"]["hits"]

    if len(hits):
        parse_indicators(hits)

    scroll_id = results["_scroll_id"]

    print(f"Scroll id: {scroll_id}\n")

    while bool(scroll_id) and len(hits) >= SIZE:
        print("There are more results\n")

        # new results
        results = es.scroll(scroll_id=scroll_id, scroll="2m")
        hits = results["hits"]["hits"]
        scroll_id = results["_scroll_id"]

        if len(hits):
            parse_indicators(hits)

    print(f"Done...\n\nTotal missing: {total_missing}.\nTotal Duplicates: {total_dups}.")

if __name__ == "__main__":
    process_indicators()
    exit(0)
