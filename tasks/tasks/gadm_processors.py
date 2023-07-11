import json
import logging

import pandas as pd
from elwood import elwood
from utils import job_setup

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)

def resolution_alternatives(context, filename=None, **kwargs):
    logging.info("Called GADM resolution alternatives processor.")

    # Pre bake
    file, filename, rawfile_path = job_setup(context=context, filename=filename)
    original_dataframe = pd.read_csv(file, delimiter=",")

    admin_level = kwargs.get("admin_level", "country")

    geo_column = ""
    for geo in context.get("annotations").get("annotations").get("geo"):
        if geo.get("primary_geo", False):
            geo_type = admin_level_to_geo_type(admin_level=admin_level)
            if geo.get("geo_type") == geo_type:
                geo_column = geo.get("name")
                break
            geo_column = geo.get("name")

    # Run job
    gadm_response = elwood.get_gadm_matches(original_dataframe, geo_column, admin_level)

    # Return hardcoded response in job
    # provide gadm alternatives
    mock_gadm_alternatives = {
        "field": "CountryMockityMocked",
        "fuzzy_match": [
            {
                "raw_value": "Korea",
                "gadm_resolved": "Republic of Korea",
                "confidence": 85,
                "alternatives": [
                    "Republic of Korea",
                    "Democratic People's Republic of Korea"
                ]
            },
            {
                "raw_value": "dominica",
                "gadm_resolved": "Dominica",
                "confidence": 85,
                "alternatives": [
                    "Dominica",
                    "Dominican Republic"
                ]
            },
            {
                "raw_value": "congo",
                "gadm_resolved": "Democratic Republic of the Congo",
                "confidence": 85,
                "alternatives": [
                    "Democratic Republic of the Congo",
                    "Republic of the Congo"
                ]
            },
            {
                "raw_value": "gunea",
                "gadm_resolved": "Guinea",
                "confidence": 85,
                "alternatives": [
                    "Guinea",
                    "Guinea-Bissau",
                    "Equatorial Guinea",
                    "Guyana",
                    "Ghana"
                ]
            },
            {
                "raw_value": "Virgin Islands",
                "gadm_resolved": "US Virgin Islands",
                "confidence": 85,
                "alternatives": [
                    "US Virgin Islands",
                    "British Virgin Islands"
                ]
            },
            {
                "raw_value": "Samoa",
                "gadm_resolved": "Samoa",
                "confidence": 85,
                "alternatives": [
                    "Samoa",
                    "American Samoa"
                ]
            }
        ]
    }

    return gadm_response


def all_gadm_values(context, filename=None, **kwargs):
    admin_level = kwargs.get("admin_level", "country")

    gadm_list = elwood.gadm_list_all(admin_level)

    response = {"gadm_entries": gadm_list.tolist()}

    print(gadm_list)

    return json.loads(json.dumps(response))


def admin_level_to_geo_type(admin_level):
    if admin_level == "country":
        return "country"
    if admin_level == "admin1":
        return "state/territory"
    if admin_level == "admin2":
        return "county/district"
    if admin_level == "admin3":
        return "municipality/town"


if __name__ == "__main__":
    import pprint

    pp = pprint.PrettyPrinter(indent=2)

    out = resolution_alternatives(context={})

    print("-->>Out GADM:\n")
    pp.pprint(out)
