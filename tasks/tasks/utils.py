import os
import tempfile
from urllib.parse import urlparse

import botocore
import boto3

# S3 OBJECT

s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("STORAGE_HOST") or None,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=None,
    config=boto3.session.Config(signature_version="s3v4"),
    verify=False,
)
DATASET_STORAGE_BASE_URL = os.environ.get("DATASET_STORAGE_BASE_URL")


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
    location_info = urlparse(path.replace("file:///", "s3://"))

    try:
        file_path = location_info.path.lstrip("/")
        raw_file = tempfile.TemporaryFile()
        s3.download_fileobj(
            Bucket=location_info.netloc, Key=file_path, Fileobj=raw_file
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

    location_info = urlparse(path.replace("file:///", "s3://"))

    output_path = location_info.path.lstrip("/")
    s3.put_object(Bucket=location_info.netloc, Key=output_path, Body=fileobj)


def list_files(path):
    location_info = urlparse(path.replace("file:///", "s3://"))

    s3_list = s3.list_objects(Bucket=location_info.netloc, Prefix=location_info.path)
    s3_contents = s3_list["Contents"]
    final_file_list = []
    for x in s3_contents:
        filename = x["Key"]
        final_file_list.append(f"{location_info.path}/{filename}")

    return final_file_list


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
    location_info = urlparse(path.replace("file:///", "s3://"))

    try:
        file_path = location_info.path.lstrip("/")
        s3.download_file(location_info.netloc, file_path, filename)
    except botocore.exceptions.ClientError as error:
        raise FileNotFoundError() from error

    return True
