#!/usr/bin/env python
import sys
from pathlib import Path
import argparse
import csv
import pprint
import functools

# In case we wish to share/use any code within api/src:
sys.path.append(str(Path(__file__).resolve().parent.parent))

# from src.embedder_engine import embedder
# from elasticsearch import Elasticsearch

parser = argparse.ArgumentParser("Parse csv filename and other options.")

parser.add_argument("--file",
                    help="filename that contains data dictionary",
                    type=str, default="./data_dictionary.csv")

args = parser.parse_args()

type_buckets = {
    "feature": ["int", "float", "string", "binary"],

    "geo": ["latitude", "longitude", "coordinates", "country", "iso2", "iso3",
            "state/territory", "county/district", "municipality/town", "admin0", "admin1", "admin2", "admin3"],

    "date": ["month", "day", "year", "epoch", "date"]
}


def reverse_mapping(my_dict):
    new_dict = {}
    for k,v in my_dict.items():
        for x in v:
            new_dict[x] = k
    return new_dict


reverse_bucket_map = reverse_mapping(type_buckets)


# print(reverse_bucket_map)


def read_csv(filename):
    with open(filename) as f:
        file_data=csv.reader(f)
        headers=next(file_data)
        return [dict(zip(headers,i)) for i in file_data]


def group_by(list_of_dicts, prop):
    buckets = {"feature": [],
               "geo": [],
               "date": []}

    for item in list_of_dicts:
        rtype = reverse_bucket_map[item[prop]]
        buckets[rtype].append(item)

    return buckets


geo_key_mappings = {
    "data_type": "geo_type",
    "primary": "primary_geo",
}

geo_value_mappings = {
    "admin0": "country",
    "admin1": "state/territory",
    "admin2": "county/district",
    "admin3": "municipality/town"
}

date_key_mappings = {
    "data_type": "date_type",
    "primary": "primary_date",
}

def format_geos(acc, geo_list):
    acc["a"] = 1
    print(geo_list)
    return geo_list # rn returns last geo list

def format_to_elwood(dict_csv):
    # group list of dictionaries by feature|geo|dateo
    # first group since data_type will be renamed later on
    grouped = group_by(dict_csv, "data_type")

    # reformat each object to elwood schema

    return functools.reduce(format_geos, grouped["geo"])

    # grouped["geo"]
    # grouped["feature"]
    # grouped["date"]


csv_data = read_csv(args.file)

pp = pprint.PrettyPrinter(indent=2)
# pp.pprint(csv_data)

print("\n\n\n\n")

out = format_to_elwood(csv_data)

pp.pprint(out)
