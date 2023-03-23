from functools import reduce
from collections import defaultdict

"""
  Ignoring the __main__ file runner, this file deals with conversion of csv->dict output to
  the expected schema for elwood to process a dataset annotation.
"""

if __name__ == "__main__":
    import sys
    from pathlib import Path
    import csv
    import pprint
    pp = pprint.PrettyPrinter(indent=2)
    sys.path.append(str(Path(__file__).resolve().parent.parent))



from validation.MetadataSchema import GeoAnnotation, DateAnnotation, FeatureAnnotation

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

all_key_mappings = {
    "field_name": "name",
    "qualifier_role": "qualifierrole",
    "unit": "units",
    "unit_description": "units_description",
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
        "values": {},
        "parser": DateAnnotation
    }
}


def dict_val_lower(my_dict, key):
    my_dict[key] = my_dict.get(key, "").lower()


def format_schema_helper(item_dict):
    # Remove potential typos that don't affect data
    dict_val_lower(item_dict, "data_type")
    dict_val_lower(item_dict, "gadm_level")

    # Remove all empty keys first
    out_dict = {k: v for k, v in item_dict.items() if v}

    # Re-add required attributes:
    out_dict = {"display_name": ""}|out_dict

    column_type = reverse_bucket_map[out_dict.get("data_type", out_dict.get("type", "str"))]

    key_mappings = mappings[column_type]["keys"]
    value_mappings = mappings[column_type].get("values")
    out_dict = {key_mappings.get(k, k): v for k, v in out_dict.items()}
    out_dict = {k: value_mappings.get(k, {}).get(v,v) for k, v in out_dict.items()}

    # Exceptions. Fn formatters
    if out_dict.get("qualifies"):
        out_dict["qualifies"] = out_dict["qualifies"].split(",")

    if out_dict.get("date_type") == "epoch":
        dict_val_lower(out_dict, "time_format")

    return (out_dict, column_type)


def format_to_schema(acc, item_dict):
    """
    """
    out_dict, column_type = format_schema_helper(item_dict)
    parsed = mappings[column_type]["parser"].parse_obj(out_dict)
    acc[column_type].append(parsed.dict(exclude_none=True))
    return acc


def format_annotations(dict_csv):
    return reduce(
        format_to_schema,
        dict_csv,
        {"feature": [], "geo": [], "date": []}
    )






if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser("Parse csv filename and other options.")

    parser.add_argument("--file",
                        help="filename that contains data dictionary",
                        type=str, default="./data_dictionary.csv")

    args = parser.parse_args()

    def read_csv(filename):
        with open(filename) as f:
            file_data=csv.reader(f)
            headers=next(file_data)
            return [dict(zip(headers,i)) for i in file_data]
    csv_data = read_csv(args.file)

    # pp.pprint(csv_data)

    out = format_annotations(csv_data)
    pp.pprint(out)
