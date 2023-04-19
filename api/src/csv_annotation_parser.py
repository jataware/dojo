from functools import reduce
from pydantic import BaseModel, Extra, ValidationError

"""
  This file deals with conversion of csv->dict output to
  the expected schema for elwood to process a dataset annotation.
"""

if __name__ == "__main__":
    import sys
    from pathlib import Path
    import csv
    import pprint
    pp = pprint.PrettyPrinter(indent=2)
    sys.path.append(str(Path(__file__).resolve().parent.parent))


import openpyxl
from validation.MetadataSchema import GeoAnnotation, DateAnnotation, FeatureAnnotation


def extract_filled_rows(rows):
    valid_rows = [row for row in rows if any(item is not None for item in row)]
    [headers, *data] = valid_rows

    return [dict(zip(headers, v)) for v in data]


def xls_to_annotations(file):
    wb = openpyxl.load_workbook(file)
    ws = wb.active

    data = list(ws.iter_rows(values_only=True))

    return extract_filled_rows(data)


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
    if key is None:
        del my_dict[key]
    else:
        my_dict[key] = my_dict.get(key, "").lower()

class RequiredField(BaseModel):
    class Config:
        extra = Extra.allow

    data_type: str


def format_schema_helper(item_dict):
    # Remove all empty keys first
    out_dict = {k: v for k, v in item_dict.items() if v}

    # Remove potential typos that don't affect data
    dict_val_lower(out_dict, "data_type")
    dict_val_lower(out_dict, "gadm_level")

    # Re-add required attribute defaults
    out_dict = {"display_name": ""}|out_dict

    # Ensure required fields are present
    RequiredField.parse_obj(out_dict)

    column_type = reverse_bucket_map[out_dict.get("data_type", "str")]

    key_mappings = mappings[column_type]["keys"]
    value_mappings = mappings[column_type].get("values")
    out_dict = {key_mappings.get(k, k): v for k, v in out_dict.items()}
    out_dict = {k: value_mappings.get(k, {}).get(v,v) for k, v in out_dict.items()}

    # Special Cases formatters
    if out_dict.get("qualifies"):
        out_dict["qualifies"] = out_dict["qualifies"].split(",")
    if out_dict.get("date_type") == "epoch":
        dict_val_lower(out_dict, "time_format")

    return (out_dict, column_type)


def format_to_schema(acc, item_dict):
    """
    """

    try:
        out_dict, column_type = format_schema_helper(item_dict)
        parsed = mappings[column_type]["parser"].parse_obj(out_dict)
    except ValidationError as e:
        e.values = item_dict
        raise

    parsed = parsed.dict()

    if group := item_dict.get("group"):
        if stored_group := acc["groups"].get(group):
            stored_type = stored_group["data_type"]
            stored_fields = stored_group["fields"]

            # geo coordinate pair:
            if item_dict["data_type"] in ["latitude", "longitude"]:
                parsed["is_geo_pair"] = stored_fields[0]
                del acc["groups"][group]
            # multi-date annotation:
            if item_dict["data_type"] in ["year", "date", "month"]:
                if len(stored_fields) == 2:
                    # The date group fields are ready to be parsed, contains 2 cols:
                    add_assoc_property = set(["year", "day", "month"]).difference(
                        set([item_dict["data_type"], stored_type])
                    )
                    parsed["associated_columns"] = {
                        next(iter(add_assoc_property)).capitalize(): stored_fields[1],
                        stored_type.capitalize(): stored_fields[0]
                    }
                    del acc["groups"][group]
                else:
                    acc["groups"][group]["fields"].append(item_dict["field_name"])
        else:
            acc["groups"][group] = {
                "data_type": item_dict["data_type"],
                "fields": [item_dict["field_name"]]
            }

    acc[column_type].append(parsed)
    return acc


def format_annotations(dict_csv):
    formatted = reduce(
        format_to_schema,
        dict_csv,
        {"feature": [], "geo": [], "date": [], "groups": {}}
    )
    del formatted["groups"]
    return formatted



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
