import pytest

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Append out project python path for easier file-module resolution
from src.csv_annotation_parser import format_annotations, format_schema_helper

"""
Running:
- Ensure install pytest. Can use pip install -r requirements_dev.txt for this
- On /api root dir, run:
$ pytest

- If you wish to use the pytest file watcher, and add options such as verbose output and print to out (for quick debugging):
$ ptw -- --testmon -s -vv
"""

# Sample csv data the parser receives, from a file converted from csv to dictionary.
# The format is the same if parsing from a local file or from API upload
csv_data = [{
    'coord_format': '',
    'data_type': 'int',
    'date_format': '',
    'description': 'A sample value that goes in meters',
    'display_name': 'No of Deaths',
    'field_name': 'fatalities',
    'gadm_level': '',
    'group': '',
    'primary': '',
    'qualifier_role': '',
    'qualifies': '',
    'resolve_to_gadm': '',
    'units': 'body_count',
    'units_description': 'deaths'},
  { 'coord_format': '',
    'data_type': 'Admin0',
    'date_format': '',
    'description': 'all_gadm_levels',
    'display_name': '',
    'field_name': 'country',
    'gadm_level': 'admin0',
    'group': 'main_geo',
    'primary': 'Y',
    'qualifier_role': '',
    'qualifies': '',
    'resolve_to_gadm': '',
    'units': '',
    'units_description': ''},
  { 'coord_format': '',
    'data_type': 'admin1',
    'date_format': '',
    'description': 'all_gadm_levels',
    'display_name': '',
    'field_name': 'admin1',
    'gadm_level': 'admin1',
    'group': 'main_geo',
    'primary': 'Y',
    'qualifier_role': '',
    'qualifies': '',
    'resolve_to_gadm': '',
    'units': '',
    'units_description': ''},
  { 'coord_format': '',
    'data_type': 'admin2',
    'date_format': '',
    'description': 'all_gadm_levels',
    'display_name': '',
    'field_name': 'admin2',
    'gadm_level': 'admin2',
    'group': 'main_geo',
    'primary': 'Y',
    'qualifier_role': '',
    'qualifies': '',
    'resolve_to_gadm': '',
    'units': '',
    'units_description': ''},
  { 'coord_format': '',
    'data_type': 'admin3',
    'date_format': '',
    'description': 'all_gadm_levels',
    'display_name': '',
    'field_name': 'admin3',
    'gadm_level': 'admin3',
    'group': 'main_geo',
    'primary': 'Y',
    'qualifier_role': '',
    'qualifies': '',
    'resolve_to_gadm': '',
    'units': '',
    'units_description': ''},
  { 'coord_format': '',
    'data_type': 'string',
    'date_format': '',
    'description': 'general region of main_geo',
    'display_name': 'General Region',
    'field_name': 'region',
    'gadm_level': '',
    'group': '',
    'primary': '',
    'qualifier_role': 'breakdown',
    'qualifies': 'main_geo',
    'resolve_to_gadm': '',
    'units': 'na',
    'units_description': ''},
  { 'coord_format': '',
    'data_type': 'year',
    'date_format': '%Y',
    'description': 'sample date',
    'display_name': '',
    'field_name': 'year',
    'gadm_level': '',
    'group': 'main_date',
    'primary': 'Y',
    'qualifier_role': '',
    'qualifies': '',
    'resolve_to_gadm': '',
    'units': '',
    'units_description': ''},
{ 'coord_format': '',
    'data_type': 'epoch',
    'date_format': '',
    'description': 'timestamp of pronounced death',
    'display_name': 'Epoch',
    'field_name': 'timestamp',
    'gadm_level': '',
    'group': '',
    'primary': '',
    'qualifier_role': '',
    'qualifies': '',
    'resolve_to_gadm': '',
    'units': '',
    'units_description': ''}]


def test_format_annotations():
    output = format_annotations(csv_data)

    dates = output["date"]

    assert dates == [{
        'name': 'year',
        'display_name': '',
        'description': 'sample date',
        'type': 'date',
        'date_type': 'year',
        'primary_date': True,
        'time_format': '%Y',
        'aliases': {},
    }, {
        'name': 'timestamp',
        'display_name': 'Epoch',
        'description': 'timestamp of pronounced death',
        'type': 'date',
        'date_type': 'epoch',
        'time_format': '',
        'aliases': {},
    }]

    geos = output["geo"]

    assert geos == [{
        'name': 'country',
        'display_name': '',
        'description': 'all_gadm_levels',
        'type': 'geo',
        'geo_type': 'country',
        'primary_geo': True,
        'aliases': {},
        'gadm_level': 'admin0'
    }, {
        'name': 'admin1',
        'display_name': '',
        'description': 'all_gadm_levels',
        'type': 'geo',
        'geo_type': 'state/territory',
        'primary_geo': True,
        'aliases': {},
        'gadm_level': 'admin1'
    }, {
        'name': 'admin2',
        'display_name': '',
        'description': 'all_gadm_levels',
        'type': 'geo',
        'geo_type': 'county/district',
        'primary_geo': True,
        'aliases': {},
        'gadm_level': 'admin2'
    }, {
        'name': 'admin3',
        'display_name': '',
        'description': 'all_gadm_levels',
        'type': 'geo',
        'geo_type': 'municipality/town',
        'primary_geo': True,
        'aliases': {},
        'gadm_level': 'admin3'
    }]


def test_format_schema_helper_feature():

    input = {
        'coord_format': '',
        'data_type': 'int',
        'date_format': '',
        'description': 'A sample value that goes in meters',
        'display_name': 'No of Deaths',
        'field_name': 'fatalities',
        'gadm_level': '',
        'group': '',
        'primary': '',
        'qualifier_role': '',
        'qualifies': '',
        'resolve_to_gadm': '',
        'units': 'body_count',
        'units_description': 'deaths'
    }

    output = format_schema_helper(input)

    assert output == ({
        'description': 'A sample value that goes in meters',
        'display_name': 'No of Deaths',
        'feature_type': 'int',
        'name': 'fatalities',
        'units': 'body_count',
        'units_description': 'deaths'
    }, 'feature')



def test_format_annotations_multidate():
    output = format_annotations([{
        'coord_format': '',
        'data_type': 'day',
        'date_format': '%d',
        'description': 'sample date',
        'display_name': '',
        'field_name': 'day',
        'gadm_level': '',
        'group': 'date1',
        'primary': 'y',
        'qualifier_role': '',
        'qualifies': '',
        'resolve_to_gadm': '',
        'units': '',
        'units_description': ''
    }, {
        'coord_format': '',
        'data_type': 'month',
        'date_format': '%m',
        'description': 'sample date',
        'display_name': '',
        'field_name': 'month',
        'gadm_level': '',
        'group': 'date1',
        'primary': 'y',
        'qualifier_role': '',
        'qualifies': '',
        'resolve_to_gadm': '',
        'units': '',
        'units_description': ''
    }, {
        'coord_format': '',
        'data_type': 'year',
        'date_format': '%Y',
        'description': 'sample date',
        'display_name': '',
        'field_name': 'year',
        'gadm_level': '',
        'group': 'date1',
        'primary': 'y',
        'qualifier_role': '',
        'qualifies': '',
        'resolve_to_gadm': '',
        'units': '',
        'units_description': ''
    }])

    assert output["date"][2]["associated_columns"] == {'Day': 'day', 'Month': 'month'}


def test_format_annotations_geo_pair():

    output = format_annotations([{
        'coord_format': '',
        'data_type': 'latitude',
        'date_format': '',
        'description': 'coordinate pair',
        'display_name': 'latlon',
        'field_name': 'latitude',
        'gadm_level': '',
        'group': 'latlonpair',
        'primary': '',
        'qualifier_role': '',
        'qualifies': '',
        'resolve_to_gadm': '',
        'units': '',
        'units_description': ''
    }, {
        'coord_format': '',
        'data_type': 'longitude',
        'date_format': '',
        'description': 'coordinate pair 2',
        'display_name': 'latlon',
        'field_name': 'longitude',
        'gadm_level': '',
        'group': 'latlonpair',
        'primary': '',
        'qualifier_role': '',
        'qualifies': '',
        'resolve_to_gadm': '',
        'units': '',
        'units_description': ''
    }])

    assert output["geo"] == [{
        'aliases': {},
        'description': 'coordinate pair',
        'display_name': 'latlon',
        'geo_type': 'latitude',
        'name': 'latitude',
        'type': 'geo'
    }, {
        'aliases': {},
        'description': 'coordinate pair 2',
        'display_name': 'latlon',
        'geo_type': 'longitude',
        'is_geo_pair': 'latitude',
        'name': 'longitude',
        'type': 'geo'
    }]




    # print("\n\n")
    # import pprint
    # pp = pprint.PrettyPrinter(indent=2)
    # pp.pprint(output["geo"])

