import os
from collections import namedtuple
import re
import tempfile
from urllib.parse import urlparse
from typing import Optional

import botocore
import boto3

import logging

from settings import settings

# S3 OBJECT

s3 = boto3.client(
    "s3",
    endpoint_url=settings.STORAGE_HOST,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    aws_session_token=None,
    config=boto3.session.Config(signature_version="s3v4"),
    verify=False,
)
DATASET_STORAGE_BASE_URL = settings.DATASET_STORAGE_BASE_URL


# FILE I/O UTILS

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


def download_rawfile(path, filename):
    """Downloads a file from a filepath

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
    logging.warn(path)
    logging.warn(file_info)

    try:
        s3.download_file(file_info.bucket, file_info.path, filename)
    except botocore.exceptions.ClientError as error:
        raise FileNotFoundError() from error

    return True


def persist_untransformed_file(uuid, filename, file):
    # Check if file has already been persisted
    file_list = list_files(os.path.join(DATASET_STORAGE_BASE_URL, uuid))
    for path in file_list:
        if "_untransformed" in path.split("/")[-1]:
            return

    # Make a filepath to persist the original file
    original_file_path = os.path.join(
        DATASET_STORAGE_BASE_URL,
        uuid,
        filename.split(".")[0] + "_untransformed.csv",
    )

    # Put original file
    put_rawfile(original_file_path, file)


def rewrite_file(origin_file_path, target_file_path):
    try:
        file = get_rawfile(origin_file_path)

        put_rawfile(target_file_path, file)
        return "File rewritten", True
    except FileNotFoundError as error:
        return "File not found, nothing was changed", False


# RQ JOB UTILS
def job_setup(context, filename):
    # Setup
    # If no filename is passed in, default to the converted raw_data file.
    if filename is None:
        filename = "raw_data.csv"

    # Always analyze the csv version of the file
    if not filename.endswith(".csv"):
        filename = filename.split(".")[0] + ".csv"

    rawfile_path = os.path.join(DATASET_STORAGE_BASE_URL, context["uuid"], filename)
    file = get_rawfile(rawfile_path)

    return file, filename, rawfile_path


def get_primary_time_format(context):
    annotations = context.get("annotations").get("annotations")

    date_annotations = annotations.get("date")

    for date_obj in date_annotations:
        if date_obj.get("primary_date", False):
            time_format = date_obj.get("time_format")
            return time_format

    # Default to first date object time format.
    return (
        context.get("annotations").get("annotations").get("date")[0].get("time_format")
    )
