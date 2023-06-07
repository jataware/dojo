#!/usr/bin/env python

"""
Script verifies how many dataset.outputs are missing in features index, as well
as checks for duplicate features index duplicates (shouldn't occur).
"""

import sys
from pathlib import Path
import argparse

# sys.path.append(str(Path(__file__).resolve().parent.parent))

from elasticsearch import Elasticsearch

parser = argparse.ArgumentParser("Parse indicators and upload features to elasticsearch.")
parser.add_argument("--es-host",
                    help="Elasticsearch host",
                    type=str, default="localhost:9200")

args = parser.parse_args()

es = Elasticsearch(f"http://{args.es_host}")

print(es.info())


def compareOutputsToFeatures(indicatorDictionary, indicator_id, totals):

    for index, output in enumerate(indicatorDictionary["outputs"]):

        feature_id = f"{indicator_id}-{output['name']}";
        body = {
            "query": {
                "match": {"_id": feature_id}
            }
        }
        res = es.search(index="features", body=body)

        total_found = res["hits"]["total"]["value"]

        if total_found == 0:
            totals["missing"] += 1
        elif total_found > 1:
            totals["duplicates"] += 1

    return totals


def process_indicator_page(hits, totals):
    print(f"This page found {len(hits)} indicator hits.")

    for _, indicator in enumerate(hits):
        one_match = indicator["_source"]
        indicator_id = one_match["id"]

        print(f"\nProcessing indicator with id: {indicator_id}\n")

        compareOutputsToFeatures(one_match, indicator_id, totals)
        totals["processed"] += 1

    return totals


SIZE = 10

def lookup_all_indicators():
    totals = {
        "processed": 0,
        "missing": 0,
        "duplicates": 0
    }

    all_indicators = {
        "query": {
            "match_all": {}
        }
    }

    results = es.search(index="indicators", body=all_indicators, scroll="2m", size=SIZE)

    hits = results["hits"]["hits"]

    if len(hits):
        totals = process_indicator_page(hits, totals)

    scroll_id = results["_scroll_id"]

    print(f"Scroll id: {scroll_id}\n")

    while bool(scroll_id) and len(hits) >= SIZE:
        print("There are more results\n")

        results = es.scroll(scroll_id=scroll_id, scroll="2m")
        hits = results["hits"]["hits"]
        scroll_id = results["_scroll_id"]

        if len(hits):
            totals = process_indicator_page(hits, totals)

    print(f"Done.\n\nTotal missing: {totals['missing']}.\nTotal Duplicates: {totals['duplicates']}.\n")


if __name__ == "__main__":
    lookup_all_indicators()
    exit(0)
