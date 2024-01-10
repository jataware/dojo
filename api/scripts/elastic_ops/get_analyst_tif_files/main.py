from elasticsearch import Elasticsearch, exceptions as es_exceptions
import botocore.exceptions
import argparse
from pathlib import Path
from os.path import join as path_join, exists, environ
import pprint
import boto3
from fuzzywuzzy import fuzz
from dotenv import load_dotenv

load_dotenv()

pp = pprint.PrettyPrinter(indent=2)

CURRENT_BUCKET_PATH = environ.get("BUCKET_KEY_PREFIX")  # something like current/datasets/some-pattern
ROOT_BUCKET = environ.get("DOJO_BUCKET")  # Something like "world-modelers"
DATASETS_INDEX = environ.get("DATASETS_INDEX")
ANNOTATIONS_INDEX = environ.get("ANNOTATIONS_INDEX")

"""
Bit of a REPL dev script discovering tif files from
es metadata on a deployed instance; consolitading file metadata
and downloading original raw files from S3.

TODO Needs documentation for others to properly use
"""


def get_project_root() -> Path:
    return Path(__file__).parent


def output_path(filename):
    return path_join(get_project_root(), "tif-out", filename)


parser = argparse.ArgumentParser("get indicator from elasticsearch.")

parser.add_argument("--es-host",
                    help="Elasticsearch host",
                    type=str, default="localhost:9200")

cli_args = parser.parse_args()

es = Elasticsearch(f"http://{cli_args.es_host}")


def indicator_source_by_id(id):
    return es.get_source(index=DATASETS_INDEX, id=id)


def find_tif_annotations():
    INDEX = ANNOTATIONS_INDEX

    es_body = {
        "query": {
            "match_all": {
            }
        },
        "_source": ["metadata.files", "annotations"]
    }

    # Forget pagination- we have less than 300 for now
    PAGE_SIZE = 500

    results = es.search(index=INDEX, body=es_body, size=PAGE_SIZE)

    hits = results["hits"]["hits"]

    all_tif_metadata = []

    for metadata in hits:
        id = metadata["_id"]

        if not metadata["_source"].get("metadata"):
            continue

        for (raw_file_key, file_data) in metadata["_source"]["metadata"]["files"].items():
            if file_data.get("filename", "").endswith("tif"):

                indicator_source = {}
                try:
                    indicator_source = indicator_source_by_id(id)
                except es_exceptions.NotFoundError:
                    print(f"skip indicator, es data not found for id: {id}")

                data_paths = indicator_source.get("data_paths", [])

                all_tif_metadata.append(
                    {
                        "filename": file_data["filename"],
                        "id": id,
                        "s3_path": data_paths[0].replace(f"{id}.parquet.gzip", "") if len(data_paths) else None,
                        "annotations": metadata["_source"].get("annotations", {}),
                        "file_data": file_data,
                    }
                )

    print("matching_data")
    pp.pprint(all_tif_metadata)
    return all_tif_metadata


def match_full_bucket_path(top_bucket, ids):
    """
    Silly little function that crawls S3 from a root bucket to match
    for a file of ids/files. Easier and more stable to ignore this and find 
    all S3 paths in the elasticsearch annotations/indicators indeces.
    Will leave in for others to enjoy chatgpt's ingenuity.
    """
    s3 = boto3.resource('s3')
    bucket = s3.Bucket(top_bucket)
    for obj in bucket.objects.all():
        for key in ids:
            if fuzz.partial_ratio(key, obj.key) > 80:
                if obj.key.endswith('tif'):
                    print(f"{obj.key}")
    print("Fuzzy search complete.")


# Hardcoded IDs found from running this command at some point
# Since I was REPL'ing and discovering, the output of some fns is just pasted here
# and passed in to the next caller. Others may find more value on returning from
# fns and passing through memory
tif_ids = [
    '842812d6-b68d-4d19-9539-2364d17a0ec0',
    '9d4ef1d2-fc4c-4d2c-a753-01a3f696ccf1',
    '4a1bd64a-90ee-4d00-8ff7-69f6406fc104',
    'fa512ed3-b7aa-4a16-bedc-41dac9510e4d',
    '811384f2-ce7e-4087-ae5c-0f91642ffc5f',
    '4c727600-f3c9-40c8-acf4-05d13b3e3062',
    '1672b41d-8e39-4357-87c0-770c93e86eb5',
    'b2d16ae9-92a4-476a-b8e2-f4b45af350cd',
    'cef78ad1-234c-42bf-b84b-42ff78860adf',
    '5ca7b756-e051-4188-b491-371d625d8189',
    'e4e67e9d-a823-45d6-bec4-02af2c98ee16',
    '5133f713-e99a-4e0d-a9cd-751d7a4cc2bf',
    '7d5c27e5-7e27-491b-90d6-2529d7544674',
    '4248b287-acd9-43bb-8ee8-be75aa8a1a22',
    'e2c074e4-28fa-4d1a-a650-5a0bb285c599',
    '794312cf-636c-498a-9ff3-e59c5489ba43',
    'ae39999b-61ff-41a1-8115-2e2f8466ffaf'
]

# This is a guess of the location of the most commonly found datasets on our bucket
# we used other buckets previously- some of these may be location on a different
# path (key!)
exact_keys = [
    f'{CURRENT_BUCKET_PATH}842812d6-b68d-4d19-9539-2364d17a0ec0/raw_data.tif',
    f'{CURRENT_BUCKET_PATH}9d4ef1d2-fc4c-4d2c-a753-01a3f696ccf1/raw_data.tif',
    f'{CURRENT_BUCKET_PATH}4a1bd64a-90ee-4d00-8ff7-69f6406fc104/raw_data.tif',
    f'{CURRENT_BUCKET_PATH}fa512ed3-b7aa-4a16-bedc-41dac9510e4d/raw_data.tif',
    f'{CURRENT_BUCKET_PATH}811384f2-ce7e-4087-ae5c-0f91642ffc5f/raw_data.tif',
    f'{CURRENT_BUCKET_PATH}4c727600-f3c9-40c8-acf4-05d13b3e3062/raw_data.tif',
    f'{CURRENT_BUCKET_PATH}1672b41d-8e39-4357-87c0-770c93e86eb5/raw_data.tif',
    f'{CURRENT_BUCKET_PATH}b2d16ae9-92a4-476a-b8e2-f4b45af350cd/raw_data.tif',
    f'{CURRENT_BUCKET_PATH}cef78ad1-234c-42bf-b84b-42ff78860adf/raw_data.tif',
    f'{CURRENT_BUCKET_PATH}5ca7b756-e051-4188-b491-371d625d8189/raw_data.tif',
    f'{CURRENT_BUCKET_PATH}e4e67e9d-a823-45d6-bec4-02af2c98ee16/raw_data.tif',
    f'{CURRENT_BUCKET_PATH}5133f713-e99a-4e0d-a9cd-751d7a4cc2bf/raw_data.tif',
    f'{CURRENT_BUCKET_PATH}7d5c27e5-7e27-491b-90d6-2529d7544674/raw_data.tif',
    f'{CURRENT_BUCKET_PATH}4248b287-acd9-43bb-8ee8-be75aa8a1a22/raw_data.tif',
    f'{CURRENT_BUCKET_PATH}e2c074e4-28fa-4d1a-a650-5a0bb285c599/raw_data.tif',
    f'{CURRENT_BUCKET_PATH}794312cf-636c-498a-9ff3-e59c5489ba43/raw_data.tif',
    f'{CURRENT_BUCKET_PATH}ae39999b-61ff-41a1-8115-2e2f8466ffa/raw_data.tiff'
]

filename_ids_map = [
    {'filename': 'climatology-tas-monthly-mean.tif',
     'id': '842812d6-b68d-4d19-9539-2364d17a0ec0'},
    {'filename': 'landscan2021_2km.tif',
        'id': '9d4ef1d2-fc4c-4d2c-a753-01a3f696ccf1'},
    {'filename': '10s030e_20101117_gmted_min300_fid55_lowerres.tif',
        'id': '4a1bd64a-90ee-4d00-8ff7-69f6406fc104'},
    {'filename': 'landscan-global-2021.tif',
        'id': 'fa512ed3-b7aa-4a16-bedc-41dac9510e4d'},
    {'filename': 'locust_presence.tif',
        'id': '811384f2-ce7e-4087-ae5c-0f91642ffc5f'},
    {'filename': 'locust_presence.tif',
        'id': '4c727600-f3c9-40c8-acf4-05d13b3e3062'},
    {'filename': 'gpw_v4_population_count_rev11_2020_30_min.tif',
        'id': '1672b41d-8e39-4357-87c0-770c93e86eb5'},
    {'filename': 'flood_5_months-geo-res-geo-cov-temp-cov.tif',
        'id': 'b2d16ae9-92a4-476a-b8e2-f4b45af350cd'},
    {'filename': 'ndwlog_rcp45_2040_2069_cog (2).tif',
        'id': 'cef78ad1-234c-42bf-b84b-42ff78860adf'},
    {'filename': 'ndwlog_historical_cog (1).tif',
        'id': '5ca7b756-e051-4188-b491-371d625d8189'},
    {'filename': 'ndwlog_rcp45_2020_2049_cog (2).tif',
        'id': 'e4e67e9d-a823-45d6-bec4-02af2c98ee16'},
    {'filename': 'wealth_cog.tif', 'id': '7f895f7e-ee53-41ba-aec3-d618db3a8dad'},
    {'filename': 'heat_stress_2015_2030_2050_rcp 45.tif',
        'id': '5133f713-e99a-4e0d-a9cd-751d7a4cc2bf'},
    {'filename': 'heat_stress_2015_2030_2050.tif',
        'id': '7d5c27e5-7e27-491b-90d6-2529d7544674'},
    {'filename': 'heat_stress_2015_2030_2050.tif',
        'id': '4248b287-acd9-43bb-8ee8-be75aa8a1a22'},
    {'filename': 'gender_equity_cog.tif',
        'id': 'e2c074e4-28fa-4d1a-a650-5a0bb285c599'},
    {'filename': 'health_facility_access_cog.tif',
        'id': '794312cf-636c-498a-9ff3-e59c5489ba43'},
    {'filename': 'banking_access_cog.tif',
        'id': 'ae39999b-61ff-41a1-8115-2e2f8466ffaf'}]


def find_dict_by_id(dict_list, id_str):
    for d in dict_list:
        if d['id'] == id_str:
            return d['filename']
    return None


def get_filename_for_id(id):
    return find_dict_by_id(filename_ids_map, id)


def download_files(bucket_path, keys, all_ids):
    """
    Given a top-level S3 bucket name, and a list of the rest of the key-path,
    downloads all files. A bit terrible- see sample usage from inputs on bottom
    of (__main__) file.
    """
    s3 = boto3.resource('s3')

    failed = []
    failed_paths = []
    skipped = []

    for idx, key in enumerate(keys):
        # print(key)
        id = all_ids[idx]
        filename = get_filename_for_id(id)
        location = output_path(filename)

        # Skip download of existing files
        if exists(location):
            print(f"Skip download, key {key} id {id} already downloaded.")
            skipped.append(key)
            continue

        try:
            s3.Bucket(bucket_path).download_file(key, location)
        except botocore.exceptions.ClientError:
            print(f'Skip download, file does not exist:\nid: {id}\nfilename: {filename}\n')
            failed_paths.append(key)
            failed.append(id)

    download_count = len(keys) - len(failed) - len(skipped)
    print(f"Downloaded {download_count} files from {bucket_path}.")

    print("Failed paths:")
    pp.pprint(failed_paths)

    print("Failed ids:")
    pp.pprint(failed)


# ANGTFT-
# We'll just capture everything that failed and retry to a different guessed path!
failed_ids_reformat = [
    'cef78ad1-234c-42bf-b84b-42ff78860adf',
    '5ca7b756-e051-4188-b491-371d625d8189',
    'e4e67e9d-a823-45d6-bec4-02af2c98ee16',
    '5133f713-e99a-4e0d-a9cd-751d7a4cc2bf',
    '7d5c27e5-7e27-491b-90d6-2529d7544674',
    '4248b287-acd9-43bb-8ee8-be75aa8a1a22',
    'e2c074e4-28fa-4d1a-a650-5a0bb285c599',
    '794312cf-636c-498a-9ff3-e59c5489ba43',
    'ae39999b-61ff-41a1-8115-2e2f8466ffaf'
]


def add_datasets_keypath(id):
    return f"datasets/{id}/raw_data.tif"


if __name__ == "__main__":

    find_tif_annotations()

    # match_full_bucket_path(ROOT_BUCKET, tif_ids)

    download_files(ROOT_BUCKET, exact_keys, tif_ids)

    # Now call download_files with different exact keys for the items that failed
    # reformatted_keys = list(map(add_datasets_keypath, failed_ids_reformat))
    # pp.pprint(reformatted_keys)
    # download_files(ROOT_BUCKET, reformatted_keys, failed_ids_reformat)

    # s = indicator_source_by_id("ae39999b-61ff-41a1-8115-2e2f8466ffaf")
    # pp.pprint(s)
