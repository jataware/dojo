import time
import os
from io import BytesIO
import tempfile
from urllib.parse import urlparse
import logging

import botocore
import boto3
from settings import settings

# S3 OBJECT
s3_client = boto3.client("s3")

storage_host=os.getenv("STORAGE_HOST")
if "minio" in storage_host:
    s3 = boto3.resource(
        "s3",
        endpoint_url=os.getenv("STORAGE_HOST"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        aws_session_token=None,
        config=boto3.session.Config(signature_version="s3v4"),
        verify=False,
    )
else:
    s3 = boto3.resource(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=None,
    config=boto3.session.Config(signature_version="s3v4"),
    verify=False,
)

DATASET_STORAGE_BASE_URL = os.environ.get("DATASET_STORAGE_BASE_URL")


def download_rawfile(path,filename):
    """Downloads a file from a filepath
    """
    location_info = urlparse(path)

    if location_info.scheme.lower() in ["s3", "minio"]:
        try:
            file_path = location_info.path.lstrip("/")
            s3.Bucket(location_info.netloc).download_file(file_path,f'processing/{filename}')

        except botocore.exceptions.ClientError as error:
            raise FileNotFoundError() from error
    else:
        raise RuntimeError("File storage format is unknown")

    return True



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
    location_info = urlparse(path)

    if location_info.scheme.lower() == "file":
        return open(location_info.path, "rb")
    if location_info.scheme.lower() in ["s3", "minio"]:
        try:
            file_path = location_info.path.lstrip("/")
            raw_file = tempfile.TemporaryFile()
            s3.Object(location_info.netloc, file_path).download_fileobj(raw_file)
            raw_file.seek(0)
        except botocore.exceptions.ClientError as error:
            raise FileNotFoundError() from error
    else:
        raise RuntimeError("File storage format is unknown")

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

    location_info = urlparse(path)

    if location_info.scheme.lower() == "file":
        if not os.path.isdir(os.path.dirname(location_info.path)):
            os.makedirs(os.path.dirname(location_info.path), exist_ok=True)
        with open(location_info.path, "wb") as output_file:
            output_file.write(fileobj.read())
    elif location_info.scheme.lower() in ["s3", "minio"]:
        output_path = location_info.path.lstrip("/")
        s3.Object(location_info.netloc, output_path).put(Body=fileobj)
    else:
        raise RuntimeError("File storage format is unknown")


def list_files(path):
    location_info = urlparse(path)
    if location_info.scheme.lower() == "file":
        return os.listdir(location_info.path)
    elif location_info.scheme.lower() == "s3":
        s3_list = s3_client.list_objects(
            Bucket=location_info.netloc, Marker=location_info.path
        )
        s3_contents = s3_list["Contents"]
        final_file_list = []
        for x in s3_contents:
            filename = x["Key"]
            final_file_list.append(f"{location_info.path}/{filename}")

        return final_file_list
    else:
        raise RuntimeError("File storage format is unknown")
