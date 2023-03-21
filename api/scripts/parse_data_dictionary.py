#!/usr/bin/env python
import sys
from pathlib import Path
import argparse
import csv
import pprint
from functools import reduce

# In case we wish to share/use any code within api/src:
sys.path.append(str(Path(__file__).resolve().parent.parent))

from validation.MetadataSchema import GeoAnnotation, DateAnnotation, FeatureAnnotation

parser = argparse.ArgumentParser("Parse csv filename and other options.")

parser.add_argument("--file",
                    help="filename that contains data dictionary",
                    type=str, default="./data_dictionary.csv")

args = parser.parse_args()

pp = pprint.PrettyPrinter(indent=2)

type_buckets = {
    "feature": ["int", "float", "string", "binary", "boolean", "str", "integer", "bool"],

    "geo": ["latitude", "longitude", "coordinates", "country", "iso2", "iso3",
            "state", "territory", "county", "district", "municipality", "town",
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

# NOTE print(reverse_bucket_map)

def read_csv(filename):
    with open(filename) as f:
        file_data=csv.reader(f)
        headers=next(file_data)
        return [dict(zip(headers,i)) for i in file_data]


all_key_mappings = {
    "field_name": "name",
    "qualifier_role": "qualifierrole"
}

geo_key_mappings = {
    "data_type": "geo_type",
    "primary": "primary_geo",
    "coords_format": "coord_format",
    "coordinates_format": "coord_format",
    "coordinate_format": "coord_format"
}|all_key_mappings

# Allows users to enter any of these, which would confuse Mr. Elwood
# but can be corrected beforehand
# Implement as data conformer in pydantic model itself?
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

mappings = {
    "feature": {
        "keys": feature_key_mappings,
        "values": feature_value_mappings,
        "parser": FeatureAnnotation
    },
    "geo": {
        "keys": geo_key_mappings,
        "values": geo_value_mappings,
        "parser": GeoAnnotation
    },
    "date": {
        "keys": date_key_mappings,
        "parser": DateAnnotation
    }
}

# NOTE helpful to print key|value_mappings
# print(f"\n\n>>> Using the following mappings:\n\n\n")
# pp.pprint(mappings)


def format_annotations(acc, item_dict):
    # remove empty keys, lowercase all values
    out_dict = {k: v.lower() for k, v in item_dict.items() if v}

    column_type = reverse_bucket_map[out_dict.get("data_type", out_dict.get("type", "str"))]

    km = mappings[column_type]["keys"]
    vm = mappings[column_type].get("values")

    if km:
        out_dict = {km.get(k, k): v for k, v in out_dict.items()}
    if vm:
        out_dict = {k: vm.get(k, {}).get(v,v) for k, v in out_dict.items()}

    if out_dict.get("qualifies"):
        out_dict["qualifies"] = out_dict["qualifies"].split(",")

    parsed = mappings[column_type]["parser"].parse_obj(out_dict)

    # Might not need dict() on integration.
    acc[column_type].append(parsed.dict(exclude_none=True))
    return acc


def format_to_elwood(dict_csv):
    return reduce(
        format_annotations,
        dict_csv,
        {"feature": [], "geo": [], "date": []}
    )


csv_data = read_csv(args.file)

# pp.pprint(csv_data)

out = format_to_elwood(csv_data)

pp.pprint(out)
