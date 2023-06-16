import io
import logging
import io
import json
import os
import re

import sys

# from base_annotation import BaseProcessor
# from settings import settings



def resolution_alternatives(context):

    logging.info("Called GADM resolution alternatives processor.")

    # uuid = context["uuid"]

    # Return hardcoded response in job
    # provide gadm alternatives
    mock_gadm_alternatives = [
        {
            "raw_value": "Korea",
            "gadm_resolved": "Republic of Korea",
            "alternatives": [
                "Republic of Korea",
                "Democratic People's Republic of Korea"
            ]
        },
        {
            "raw_value": "dominica",
            "gadm_resolved": "Dominica",
            "alternatives": [
                "Dominica",
                "Dominican Republic"
            ]
        },
        {
            "raw_value": "congo",
            "gadm_resolved": "Democratic Republic of the Congo",
            "alternatives": [
                "Democratic Republic of the Congo",
                "Republic of the Congo"
            ]
        },
        {
            "raw_value": "Niger",
            "gadm_resolved": "Niger",
            "alternatives": [
                "Niger",
                "Nigeria"
            ]
        },
        {
            "raw_value": "gunea",
            "gadm_resolved": "Guinea",
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
            "alternatives": [
                "US Virgin Islands",
                "British Virgin Islands"
            ]
        },
        {
            "raw_value": "Samoa",
            "gadm_resolved": "Samoa",
            "alternatives": [
                "Samoa",
                "American Samoa"
            ]
        }
    ];

    return mock_gadm_alternatives


if __name__ == '__main__':

    import pprint
    pp = pprint.PrettyPrinter(indent=2)

    out = resolution_alternatives(context={})

    print("-->>Out GADM:\n")
    pp.pprint(out)
