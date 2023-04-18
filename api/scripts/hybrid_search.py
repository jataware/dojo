#!/usr/bin/env python

"""
To run locally:
./

To run against causemos instance. If you have ssh configured and have access, and
assuming ssh/config contains a `dojo` Host:

ssh -L 9201:localhost:9200 dojo -N

"""

import sys
from pathlib import Path
import argparse
import pprint

sys.path.append(str(Path(__file__).resolve().parent.parent))

from src.embedder_engine import embedder
from elasticsearch import Elasticsearch

from colorama import init as colorama_init
from colorama import Fore
from colorama import Style

colorama_init()

parser = argparse.ArgumentParser("Parse indicators and upload features to elasticsearch.")
parser.add_argument("--es-host",
                    help="Elasticsearch host",
                    type=str, default="localhost:9201")

# parser.add_argument("--use-gpu",
#                     help="Flag to use gpu. Default to false (uses cpu instead).",
#                     type=bool, default=True)

parser.add_argument("-q", "--query",
                    help="Flag to use gpu. Default to false (uses cpu instead).",
                    type=str, default="chinese aid")

args = parser.parse_args()

es = Elasticsearch(f"http://{args.es_host}")

print(es.info())

def generate_keyword_query(term):
    q = {
        "query": {
            "bool": {
                "should": [
                    {
                        "multi_match": {
                            "query": term,
                            "operator": "and",
                            "fuzziness": "AUTO",
                            "fields": ["display_name", "name", "description"],
                            "type": "most_fields",
                            "slop": 2
                        }
                    },
                    {
                        "bool": {
                            "minimum_should_match": 1,
                            "should": [
                                {
                                    "match_phrase": {
                                        "description": {
                                            "query": term,
                                            "boost": 2
                                        }
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "name": {
                                            "query": term,
                                            "boost": 2
                                        }
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "display_name": {
                                            "query": term,
                                            "boost": 2
                                        }
                                    }
                                },
                                {
                                    "multi_match": {
                                        "query": term,
                                        "fields": ["display_name", "name", "description"],
                                        "type": "cross_fields",
                                        "operator": "and",
                                        "slop": 1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        "_source": {
            "excludes":  ["embeddings", "type", "unit", "unit_description",
                          "data_resolution", "alias", "ontologies",
                          "owner_dataset", "is_primary"]
        }
    }
    return q


def search(query):
    query_embedding = embedder.embed([query])[0]

    features_query = generate_keyword_query(query)

    features_query["query"]["bool"]["should"].append({
        "script_score": {
            "query": {"match_all": {}},
            "script": {
                "source": "Math.max(cosineSimilarity(params.query_vector, 'embeddings'), 0)",
                "params": {
                    "query_vector": query_embedding
                }
            }
        }
    })

    results = es.search(index="features", body=features_query, scroll="2m", size=10)

    items_in_page = len(results["hits"]["hits"])
    print(f"Items in page: {items_in_page}")

    return results

pp = pprint.PrettyPrinter(indent=2)

if __name__ == "__main__":

    # print(f"This is {Fore.GREEN}color{Style.RESET_ALL}!")

    query = args.query

    print(f"query: {query}")

    results = search(query)
    hits = results["hits"]["hits"]

    pp.pprint(hits)

    exit(0)
