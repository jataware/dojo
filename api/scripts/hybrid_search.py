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
import json

sys.path.append(str(Path(__file__).resolve().parent.parent))

from elasticsearch import Elasticsearch
from src.feature_queries import (
    keyword_query_v2,
    semantic_search_query,
    hybrid_query_v1,
    keyword_query_v1,
    hybrid_query_v0
)

import collections

recursive_dict = lambda: collections.defaultdict(recursive_dict)


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


if __name__ == "__main__":
    args = parser.parse_args()
    es = Elasticsearch(f"http://{args.es_host}")
    print(es.info())

QUERIES = [
    keyword_query_v2,
    semantic_search_query,
    hybrid_query_v1,
    keyword_query_v1,
    hybrid_query_v0
]

def search(query):

    # NOTE this is all hacked up but Ok for now; args.size would fail
    results = es.search(index="features", body=query, scroll="2m", size=args.size)

    items_in_page = len(results["hits"]["hits"])
    print(f"Items in page: {items_in_page}")

    return results

pp = pprint.PrettyPrinter(indent=2)


# TODO Get targets and sample queries from MITRE
test_inputs = [
    # {"target_id": "b1a6c625-69a1-4399-b3cb-68cf484826a7-TX.VAL.TRAN.ZS.WT",
    #  "queries": ["TX.VAL.TRAN.ZS.WT", "Transport", "Transport services", "Service for all transport types",
    #              "Services for all types of transport: air, sea, land, etc",
    #              "services that exclude freight insurance",
    #              "Rent cars"]},

    # {"target_id": "8a143348-f0bd-4142-9661-2ca7e5806433-SE.SEC.NENR.FE",
    #  "queries": ["ratio girls school", "poverty rate indicators from female population",
    #              "education indicators", "school enrollment", "education affecting economy", "women",
    #              "women enrolled in education programs",
    #              "Education indicators female", "female"]
    #  },

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

def test_one_query(query_dict, target_id, fn):

    query = fn(query_dict)

    results = search(query)

    took = results["took"]  # ms search took

    hits = results["hits"]["hits"]

    found_index = None
    for index, result in enumerate(hits):
        if result["_id"] == target_id:
            found_index = index

    return found_index, took




def average_values(input_dict):
    index_sum = 0
    index_count = 0
    index_none_count = 0

    took_sum = 0
    took_count = 0

    for query in input_dict.values():
        for prop in query.values():
            if isinstance(prop['index'], int):
                index_sum += prop['index']
                index_count += 1
            else:
                index_sum += args.size  # prop['index']
                index_count += 1
                index_none_count += 1

            if 'took' in prop:
                took_sum += prop['took']
                took_count += 1
                        
    index_avg = round(index_sum / index_count)
    took_avg = round(took_sum / took_count)
    
    return {'index_avg': index_avg, 'took_avg': took_avg, 'none_count': index_none_count}


def generate_report(results_dict):

    acc = {}

    for algorithm in results_dict.keys():
        target = results_dict[algorithm]
        acc[algorithm] = average_values(target)

    return acc


if __name__ == "__main__":

    found_indeces = recursive_dict()

    for index, test in enumerate(test_inputs):
        target_id = test["target_id"]

        for query in test["queries"]:
            for algorithm in QUERIES:
                (foundIndex, took) = test_one_query(query, target_id, algorithm)
                found_indeces[algorithm.__name__][target_id][query]["index"] = foundIndex
                found_indeces[algorithm.__name__][target_id][query]["took"] = took

    final_results = json.loads(json.dumps(found_indeces))

    pp.pprint(final_results)

    report = generate_report(final_results)

    print("\n\n >>>>> Report:")

    pp.pprint(report)

    exit(0)
