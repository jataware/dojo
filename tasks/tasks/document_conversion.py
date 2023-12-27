# import time pipeline
from typing import List
from urllib.parse import urlparse
# import numpy as np
import re
from settings import settings
from utils import get_rawfile, put_rawfile

import os
import boto3
import json
# import botocore.exceptions  # TODO handle s3 upload/download exceptions
from pathlib import Path
from os.path import join as path_join
import requests
import subprocess

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.INFO)


def get_project_root() -> Path:
    return Path(__file__).parent.parent


s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("STORAGE_HOST") or None,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=None,
    config=boto3.session.Config(signature_version="s3v4"),
    verify=False,
)


def get_bucket_name(url):
    parsed_url = urlparse(url)
    path = parsed_url.netloc
    return path


CACHE_FOLDER = path_join(get_project_root(), "document_cache")
if not os.path.exists(CACHE_FOLDER):
    os.makedirs(CACHE_FOLDER)
BUCKET = get_bucket_name(settings.DOCUMENT_STORAGE_BASE_URL)
API_HOST = settings.DOJO_URL  # TODO This needs to be a remote API IP/hostname


def download_fileobj(fileobj, filename):
    """Downloads a fileobj to a file.

    Args:
        fileobj: A file-like object.
        filename: The filename to save the file to.
    """

    with open(filename, "wb") as f:
        for chunk in iter(lambda: fileobj.read(4096), b""):
            f.write(chunk)


def to_pdf(context):

    document_id = context["document_id"]
    s3_url = context["s3_url"]
    filename = context["filename"]

    logging.info("Joel: Converting non-pdf to PDF file:")
    logging.info(document_id)
    logging.info(s3_url)

    new_filename = re.sub(r"\.[a-zA-Z0-9]+$", ".pdf", filename)

    logging.info(f"New filename: {new_filename}")

    cache_file_path = path_join(CACHE_FOLDER, new_filename)

    file_handle = get_rawfile(s3_url)
    # s3.Bucket(BUCKET).download_file(s3_url, cache_file_path)

    download_fileobj(file_handle, cache_file_path)

    result = subprocess.run(
        # OR "soffice" if libreoffice is not found
        ["libreoffice", "--headless", "--convert-to", "pdf", cache_file_path]
    )

    logging.info(f"\nfile conversion result type : {type(result)}")
    logging.info(f"\nfile conversion result dir: {dir(result)}")
    logging.info(f"\nfile conversion result full: {result}")

    # Upload PDF to S3
    pdf_path = cache_file_path.replace(filename, new_filename)

    with open(pdf_path, "rb") as pdf_file_obj:
        put_rawfile(s3_url.replace(filename, new_filename), pdf_file_obj)

    # Call PDF extractor to continue the doc processing pipeline
    next_job_string = "paragraph_embeddings_processors.calculate_store_embeddings"

    payload = json.dumps({
        "s3_url": s3_url,
        "callback_url": f"{API_HOST}/job/{document_id}/{next_job_string}"
    })

    response = requests.post(f"{settings.OCR_URL}/{document_id}", data=payload)
    if response.status_code != 200:
        return False
