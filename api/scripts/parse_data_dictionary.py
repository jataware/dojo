#!/usr/bin/env python
import sys
from pathlib import Path
import argparse
import csv
import pprint
import functools

# In case we wish to share/use any code within api/src:
sys.path.append(str(Path(__file__).resolve().parent.parent))

# from src.sample import magic
from validation.MetadataSchema import GeoAnnotation, DateAnnotation, FeatureAnnotation


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


all_key_mappings = {
    "field_name": "name"
}

geo_key_mappings = {
    "data_type": "geo_type",
    "primary": "primary_geo",
}|all_key_mappings

# Allows users to enter any of these, which would confuse Mr. Elwood
# but can be corrected beforehand
geo_value_mappings = {
    "geo_type": {
        "admin0": "country",
        "admin1": "state/territory",
        "admin2": "county/district",
        "admin3": "municipality/town",
        "state": "state/territory",
        "territory": "state/territory",
        "county": "county/district",
        "district": "county/district",
        "municipality": "municipality/town",
        "state": "state/territory",
        "territory": "state/territory"
    }
}

date_key_mappings = {
    "data_type": "date_type",
    "primary": "primary_date",
    "date_format": "time_format"
}|all_key_mappings

feature_key_mappings = {
    "data_type": "feature_type"
}|all_key_mappings

feature_value_mappings = {
    "feature_type": {
        "string": "str",
        "string": "str",
        "integer": "int",
        "bool": "boolean"
    }
}

# TODO Merge everything to use by input:
key_mappings = {}
value_mappings = {}

# NOTE helpful to print key|value_mappings


def format_geos(acc, geo_dict):

    # remove empty keys
    geo_dict = {k: v for k, v in geo_dict.items() if v}

    # replace equiv keys
    d = dict((geo_key_mappings.get(k, k), v) for (k, v) in geo_dict.items())

    # replace equiv values
    d = dict((k, geo_value_mappings.get(k, {}).get(v,v)) for (k, v) in d.items())

    # Cast/ values with pydantic
    parsed = GeoAnnotation.parse_obj(d)

    # print(f"pydantic parsed: {parsed}")

    acc.append(parsed.dict()) # might not be needed when integrated to API
    return acc


def format_dates(acc, date_dict):

    # remove empty keys
    date_dict = {k: v for k, v in date_dict.items() if v}

    # replace equiv keys
    d = dict((date_key_mappings.get(k, k), v) for (k, v) in date_dict.items())

    # Cast/ values with pydantic
    parsed = DateAnnotation.parse_obj(d)

    acc.append(parsed.dict())
    return acc

def format_features(acc, feat_dict):
    # remove empty keys
    feat_dict = {k: v for k, v in feat_dict.items() if v}

    # replace equiv keys
    d = dict((feature_key_mappings.get(k, k), v) for (k, v) in feat_dict.items())

    # replace equiv values
    d = dict((k, feature_value_mappings.get(k, {}).get(v,v)) for (k, v) in d.items())

    # Cast/ values with pydantic
    parsed = FeatureAnnotation.parse_obj(d)

    acc.append(parsed.dict())
    return acc


def format_to_elwood(dict_csv):
    # group list of dictionaries by feature|geo|dateo
    # first group since data_type will be renamed later on
    grouped = group_by(dict_csv, "data_type")

    # reformat each object to elwood schema
    return {
        "geo": functools.reduce(format_geos, grouped["geo"], []),
        "date": functools.reduce(format_dates, grouped["date"], []),
        "feature": functools.reduce(format_features, grouped["feature"], []),
    }


csv_data = read_csv(args.file)

pp = pprint.PrettyPrinter(indent=2)
# pp.pprint(csv_data)

out = format_to_elwood(csv_data)

pp.pprint(out)
