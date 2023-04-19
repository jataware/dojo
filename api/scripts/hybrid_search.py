#!/usr/bin/env python

"""

Program to compare various es queries and search strategies with target data to be found.

To run locally:

```
./hybrid_search -q "chinese aid"
```
To run against a deployed instance: with ssh access, and
assuming ssh/config contains a `dojo` host, as well as remote port is 9200
(es default) and local forward port is 9201:

```
ssh -L 9201:localhost:9200 dojo -N
```

then run:

```
./hybrid_search -q "chinese aid" --es-host "localhost:9201"
```

Script has been edited to ignore --query,-q param for now, and contains
a set of test queries to compare search strategies.

"""

import sys
from pathlib import Path
import argparse
import pprint

sys.path.append(str(Path(__file__).resolve().parent.parent))

from src.embedder_engine import embedder
from elasticsearch import Elasticsearch

parser = argparse.ArgumentParser("Parse indicators and upload features to elasticsearch.")
parser.add_argument("--es-host",
                    help="Elasticsearch host",
                    type=str, default="localhost:9200")

parser.add_argument("-q", "--query",
                    help="query string or sentence",
                    type=str, default="chinese aid")

parser.add_argument("-s", "--size",
                    help="es scroll page result size",
                    type=int, default=10)


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
                                            "boost": 1
                                        }
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "name": {
                                            "query": term,
                                            "boost": 1
                                        }
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "display_name": {
                                            "query": term,
                                            "boost": 1
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
            "excludes": "embeddings"
        }
    }
    return q

def getWildcardsForAllProperties(t):
    return [{"wildcard": {"name": f"*{t}*"}},
            {"wildcard": {"display_name": f"*{t}*"}},
            {"wildcard": {"description": f"*{t}*"}}]


def previous_keyword_query(term):
    q = {
        "query": {
            "bool": {
                "should": []
            }
        },
        "_source": {
            "excludes": "embeddings"
        }
    }

    for item in term.split():
        q["query"]["bool"]["should"] += getWildcardsForAllProperties(item)

    return q


def semantic_search_only(query):
    query_embedding = embedder.embed([query])[0]
    return {
        "query": {
            "script_score": {
                "query": {"match_all": {}},
                "script": {
                    "source": "Math.max(cosineSimilarity(params.query_vector, 'embeddings'), 0)",
                    "params": {
                        "query_vector": query_embedding
                    }
                }
            }
        },
        "_source": {
            "excludes": ["embeddings"]
        }
    }

def gen_hybrid_search(query):
    query_embedding = embedder.embed([query])[0]

    features_query = generate_keyword_query(query)

    features_query["query"]["bool"]["should"].append({
        "script_score": {
            "query": {"match_all": {}},
            "boost": 1,
            "script": {
                "source": "Math.max(cosineSimilarity(params.query_vector, 'embeddings'), 0)",
                "params": {
                    "query_vector": query_embedding
                }
            }
        }
    })
    return features_query

def gen_hybrid_search_v2(query):
    query_embedding = embedder.embed([query])[0]

    features_query = previous_keyword_query(query)

    features_query["query"]["bool"]["should"].append({
        "script_score": {
            "query": {"match_all": {}},
            "boost": 1,
            "script": {
                "source": "Math.max(cosineSimilarity(params.query_vector, 'embeddings'), 0)",
                "params": {
                    "query_vector": query_embedding
                }
            }
        }
    })
    return features_query


def search(query):
    features_query = gen_hybrid_search(query)
    # features_query = semantic_search_only(query)
    # features_query = gen_hybrid_search_v2(query)

    results = es.search(index="features", body=features_query, scroll="2m", size=args.size)

    items_in_page = len(results["hits"]["hits"])
    print(f"Items in page: {items_in_page}")

    return results

pp = pprint.PrettyPrinter(indent=2)


test_inputs = [
    {"target_id": "b1a6c625-69a1-4399-b3cb-68cf484826a7-TX.VAL.TRAN.ZS.WT",
     "queries": ["TX.VAL.TRAN.ZS.WT", "Transport", "Transport services", "Service for all transport types",
                 "Services for all types of transport: air, sea, land, etc",
                 "services that exclude freight insurance",
                 "Rent cars"]},

    {"target_id": "8a143348-f0bd-4142-9661-2ca7e5806433-SE.SEC.NENR.FE",
     "queries": ["ratio girls school", "poverty rate indicators from female population",
                 "education indicators", "school enrollment", "education affecting economy", "women",
                 "women enrolled in education programs",
                 "Education indicators female", "female"]
     },

    {
        "target_id": "db48c2bb-9080-41d6-a5b9-916c0c6871f1-Amount (Constant USD2017)",
        "queries": ["expenses of aiding china's military", "chinese aid",
                "aid chinese", "aid to china", "aid china",
                "Chinese Military Aid in", "military aid expenses from china",
                "indicators of military expenses", "military expenses from countries",
                "military expenses in USD", "aid countries by china", "china aids countries information",
                    "china aids countries information", "china", "aid", "Military Aid in Constant USD", "Expenses in 2017"
                ]
    },
    {
        "target_id": "62fcdd55-1459-41c8-b815-e5fd90e06587-NY.ADJ.DCO2.CD",
        "queries": [
            "damage due to carbon dioxide emissions", "fossil fuel use", "global warming", "climate change",
            "savings on adjustments for climate change", "climate change adjustments budget by country",
            "CO2 emissions", "gas emissions by country", "CO2 damage", "CO2 damage in US dollars", "global warming damage in currency", "carbon dioxide climate change estimates"
        ]
    }
]

def test_one_query(query, target_id):

    results = search(query)
    hits = results["hits"]["hits"]

    # pp.pprint(hits)

    found_index = None
    for index, result in enumerate(hits):
        if result["_id"] == target_id:
            found_index = index

    return found_index


if __name__ == "__main__":

    # query = # args.query

    found_indeces = {}

    for index, test in enumerate(test_inputs):
        target_id = test["target_id"]
        for query in test["queries"]:
            print(f"query: {query}")
            foundIndex = test_one_query(query, target_id)
            if not found_indeces.get(target_id):
                found_indeces[target_id] = {}
            found_indeces[target_id][query] = foundIndex

    print("Found expected features at result index:")
    pp.pprint(found_indeces)

    exit(0)
