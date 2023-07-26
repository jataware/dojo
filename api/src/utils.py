import csv
import os
import re
import tempfile
import time
from collections import namedtuple
from datetime import date
from io import BytesIO, StringIO
from typing import Optional
from urllib.parse import urlparse
from zlib import compressobj

import boto3
import botocore
import pandas as pd
from elasticsearch import Elasticsearch
from fastapi.logger import logger
from src.settings import settings
from validation import ModelSchema

es = Elasticsearch([settings.ELASTICSEARCH_URL], port=settings.ELASTICSEARCH_PORT)
s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("STORAGE_HOST") or None,
    config=boto3.session.Config(signature_version="s3v4"),
    verify=False,
)


def try_parse_int(s: str, default: int = 0) -> int:
    try:
        return int(s)
    except ValueError:
        return default


def delete_matching_records_from_model(model_id, record_key, record_test):
    """
    This function provides an easy way to remove information from within a specific key of a model.

    - model_id: the id of the model that we should be removing information from
    - record_key: the key of the model that we should look in to remove data (ie "parameters", "outputs")
    - record_test: a function that will run on each of the records within the record_key to see whether
        they should be deleted. record_test() should return True if this record is to be deleted
    """

    from src.models import (  # import at runtime to avoid circular import error
        get_model,
        modify_model,
    )

    record_count = 0

    model = get_model(model_id)
    records = model.get(record_key, [])
    records_to_delete = []
    for record in records:
        if record_test(record):
            records_to_delete.append(record)

    for record in records_to_delete:
        record_count += 1
        records.remove(record)

    update = {record_key: records}
    modify_model(model_id, ModelSchema.ModelMetadataPatchSchema(**update))

    return record_count


def run_model_with_defaults(model_id):
    """
    This function takes in a model and submits a default run to test that model's functionality
    """

    from src.dojo import get_parameters
    from src.models import get_model
    from src.runs import create_run, current_milli_time
    from validation.RunSchema import ModelRunSchema

    model = get_model(model_id)

    params = []
    for param in get_parameters(model_id):
        param_obj = {}
        param_obj["name"] = param["annotation"]["name"]
        param_obj["value"] = param["annotation"]["default_value"]
        params.append(param_obj)

    model_name_clean = "".join(filter(str.isalnum, model["name"]))
    run_id = f"{model_name_clean}-{current_milli_time()}"

    run = ModelRunSchema(
        id=run_id,
        model_id=model_id,
        model_name=model["name"],
        parameters=params,
        data_paths=[],
        tags=[],
        is_default_run=True,
        created_at=current_milli_time(),
    )

    create_run(run)

    # Store model ID to `tests` index with `status` set to `running`
    body = {
        "status": "running",
        "model_name": model["name"],
        "created_at": run.created_at,
        "run_id": run.id,
    }
    es.index(index="tests", body=body, id=model_id)

    return run_id


S3FileInfo = namedtuple(
    "FileInfo", field_names=["bucket", "path", "region"], defaults=[None]
)


def s3_url(self):
    return f"s3://{self.bucket}/{self.path}"


S3FileInfo.s3_url = property(s3_url)


def normalize_file_info(url: str) -> Optional[S3FileInfo]:
    """ """
    url_info = urlparse(url)
    path = url_info.path.lstrip("/")
    if url_info.scheme == "file":
        return S3FileInfo(bucket=url_info.netloc, path=path)
    elif url_info.scheme == "https":
        match = re.match(
            r"https://(?P<bucket>.+)\.s3.(?P<region>.+\.)?amazonaws.com", url
        )
        if not match:
            return None
        return S3FileInfo(
            bucket=match.group("bucket"), path=path, region=match.group("region")
        )
    elif url_info.scheme == "s3":
        return S3FileInfo(bucket=url_info.netloc, path=path)
    else:
        return None


def get_rawfile(path):
    """Gets a file from a filepath

    Args:
        path (str): URI to file

    Raises:
        FileNotFoundError: If the file cannnot be found on S3.
        RuntimeError: If the path URI does not begin with 'file' or 's3'
        there is no handler for it yet.

    Returns:
        file: a file-like object
    """
    file_info = normalize_file_info(path)
    try:
        raw_file = tempfile.TemporaryFile()
        s3.download_fileobj(
            Bucket=file_info.bucket, Key=file_info.path, Fileobj=raw_file
        )
        raw_file.seek(0)
    except botocore.exceptions.ClientError as error:
        raise FileNotFoundError() from error

    return raw_file


def put_rawfile(path, fileobj):
    """Puts/uploads a file at URI specified
    Args:
        path (str): URI to put/upload the file to.
        fileobj (file): The file-like object to upload.
    Raises:
        RuntimeError: If the path URI does not begin with 'file' or 's3'
        there is no handler for it yet.
    """

    file_info = normalize_file_info(path)
    s3.put_object(Bucket=file_info.bucket, Key=file_info.path, Body=fileobj)


def list_files(path):
    file_info = normalize_file_info(path)

    s3_list = s3.list_objects(Bucket=file_info.bucket, Prefix=file_info.path)
    s3_contents = s3_list["Contents"]
    final_file_list = []
    for x in s3_contents:
        filename = x["Key"]
        final_file_list.append(f"{file_info.path}/{filename}")

    return final_file_list


async def stream_csv_from_data_paths(data_paths, wide_format="false"):

    storage_options = {
        "client_kwargs": {"endpoint_url": os.getenv("STORAGE_HOST") or None},
    }

    # Build single dataframe
    df = pd.concat(
        pd.read_parquet(
            file, storage_options=None if file.startswith("http") else storage_options
        )
        for file in data_paths
    )

    # Ensure pandas floats are used because vanilla python ones are problematic
    df = df.fillna("").astype(
        {
            col: "str"
            for col in df.select_dtypes(include=["float32", "float64"]).columns
        },
        # Note: This links it to the previous `df` so not a full copy
        copy=False,
    )
    if wide_format == "true":
        df_wide = pd.pivot(
            df, index=None, columns="feature", values="value"
        )  # Reshape from long to wide
        df = df.drop(["feature", "value"], axis=1)
        df = pd.merge(df, df_wide, left_index=True, right_index=True)

    # Prepare for writing CSV to a temporary buffer
    buffer = StringIO()
    writer = csv.writer(buffer)

    # Write out the header row
    writer.writerow(df.columns)

    yield buffer.getvalue()
    buffer.seek(0)  # To clear the buffer we need to seek back to the start and truncate
    buffer.truncate()

    # Iterate over dataframe tuples, writing each one out as a CSV line one at a time
    for record in df.itertuples(index=False, name=None):
        writer.writerow(str(i) for i in record)
        yield buffer.getvalue()
        buffer.seek(0)
        buffer.truncate()


async def compress_stream(content):
    compressor = compressobj()
    async for buff in content:
        yield compressor.compress(buff.encode())
    yield compressor.flush()


def add_date_to_dataset(path):
    file = get_rawfile(path)
    dataframe = pd.read_csv(file)
    time_format = "%Y-%m-%d"

    # Add date column
    dataframe["date"] = date.today().strftime(time_format)

    # Put data back
    csv_buffer = BytesIO()
    dataframe.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)
    put_rawfile(path, csv_buffer)

    # Return annotation for date column in dataset
    return {
        "name": "date",
        "display_name": "",
        "description": "Automatically generated date column",
        "type": "date",
        "date_type": "date",
        "primary_date": True,
        "time_format": time_format,
        "associated_columns": None,
        "qualifies": [],
        "aliases": {},
    }


def get_unique_items(list1, list2, id_property="_id"):
    ids_list1 = set(item[id_property] for item in list1)
    unique_items = [item for item in list2 if item[id_property] not in ids_list1]
    return unique_items


def alternate_lists(list1, list2, id_property=None):
    """
    Given to lists:
    - a) ["k1", "k2", "k3", "k4", "k5", "k6", "k7", "k8"]
    - b) ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"]

    returns a new list of length max_lenght(a, b) and alternates items
    stepping by 3. Example output:

    ["k1", "k2", "k3", "s1", "s2", "s3", "k4", "k5", "k6", "s4"]

    If id_property is provided, it is presumed the lists contain dictionaries,
    and the duplicates are removed by checking the id_property in the dictionary
    """

    if id_property:
        list2 = get_unique_items(list1, list2, id_property)

    # Determine the length of the longest list
    max_length = max(len(list1), len(list2))

    # Create an empty list to hold the final result
    result = []

    # Iterate over the range from 0 to the max length, stepping by 3
    for i in range(0, max_length, 3):
        # Extend result with next three elements from each list if they exist
        result.extend(list1[i:i+3])
        result.extend(list2[i:i+3])
    return result


keyword_query_names = [
    "keyword_name",
    "keyword_display_name",
    "keyword_description"
]

def group_by_query(data_list):
    grouped_dict = {
        "keyword": [],
        "semantic": [],
    }
    for item in data_list:
        # at least one matched_queries contains keyword element/aspect
        if any(i in keyword_query_names for i in item.get("matched_queries")):
            grouped_dict["keyword"].append(item)
        else:
            grouped_dict["semantic"].append(item)

    return (grouped_dict["keyword"], grouped_dict["semantic"])


def format_hybrid_results(all_results):
    keyword_results, semantic_results = group_by_query(all_results)
    alternated = alternate_lists(keyword_results, semantic_results)

    return alternated
