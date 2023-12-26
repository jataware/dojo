# import time pipeline
from typing import List
# import numpy as np
# from utils import get_rawfile
import re
from settings import settings


import os
import boto3
import json
import botocore.exceptions  # TODO handle s3 upload/download exceptions
from pathlib import Path
from os.path import join as path_join
# import tempfile
import requests
import subprocess
import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)


def get_project_root() -> Path:
    return Path(__file__).parent.parent


s3 = boto3.resource("s3")

CACHE_FOLDER = path_join(get_project_root(), "document_cache")
if not os.path.exists(CACHE_FOLDER):
    os.makedirs(CACHE_FOLDER)
BUCKET = settings.DOCUMENT_STORAGE_BASE_URL
API_HOST = settings.DOJO_URL  # TODO This needs to be an API.


def to_pdf(context):

    document_id = context["document_id"]
    s3_url = context["s3_url"]
    filename = context["filename"]

    logging.info("Converting non-pdf to PDF file:")
    logging.info(document_id)
    logging.info(s3_url)

    new_filename = re.sub(r"\.[a-zA-Z0-9]+$", ".pdf", filename)

    logging.info(f"New filename: {new_filename}")

    cache_file_path = path_join(CACHE_FOLDER, new_filename)

    s3.Bucket(BUCKET).download_file(s3_url, cache_file_path)

    result = subprocess.run(
        # OR "soffice" if libreoffice is not found
        ["libreoffice", "--headless", "--convert-to", "pdf", cache_file_path]
    )

    logging.info(f"\nfile conversion result type : {type(result)}")
    logging.info(f"\nfile conversion result dir: {dir(result)}")
    logging.info(f"\nfile conversion result full: {result}")

    # Upload PDF to S3
    new_s3_key = s3_url.replace(f"s3://{BUCKET}/", "").replace(filename, new_filename)
    logging.info(f"new s3 key: {new_s3_key}")
    s3.Bucket(BUCKET).upload_file(cache_file_path, new_s3_key)

    # Call PDF extractor to continue the doc processing pipeline
    next_job_string = "paragraph_embeddings_processors.calculate_store_embeddings"

    payload = json.dumps({
        "s3_url": s3_url,
        "callback_url": f"{API_HOST}/job/{document_id}/{next_job_string}"
    })

    response = requests.post(f"{settings.OCR_URL}/{document_id}", data=payload)
    if response.status_code != 200:
        return False


