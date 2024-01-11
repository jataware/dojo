from urllib.parse import urlparse
import re
from settings import settings
from utils import get_rawfile, put_rawfile

import os
import boto3
import json
from pathlib import Path
from os.path import join as path_join
import requests
import subprocess

from paragraph_embeddings_processors import full_document_process

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
        f.close()


def to_pdf(context):

    document_id = context["document_id"]
    s3_url = context["s3_url"]
    filename = context["filename"]

    logging.info("Converting non-pdf to PDF file process start")
    logging.info(document_id)
    logging.info(s3_url)

    new_filename = re.sub(r"\.[a-zA-Z0-9]+$", ".pdf", filename)

    logging.info(f"New PDF filename will be: {new_filename}")

    # where we'll download the doc/ppt doc to transform to PDF
    cache_file_path = path_join(CACHE_FOLDER, filename)

    file_handle = get_rawfile(s3_url)

    download_fileobj(file_handle, cache_file_path)

    subprocess.run(
        ["libreoffice", "--headless", "--convert-to", "pdf", cache_file_path, "--outdir", CACHE_FOLDER]
    )

    # Now Upload PDF output to S3..
    pdf_path = cache_file_path.replace(filename, new_filename)

    pdf_s3_url = s3_url.replace(filename, new_filename)

    with open(pdf_path, "rb") as pdf_file_obj:
        put_rawfile(pdf_s3_url, pdf_file_obj)

    # TODO Add hostname in settings for OCR_URL workflow
    api_host = "http://HOST:8080/api/dojo"
    if settings.OCR_URL:
        logging.info("Using OCR_URL")
        job_string = "paragraph_embeddings_processors.calculate_store_embeddings"
        payload = json.dumps({
            "s3_url": pdf_s3_url,
            "callback_url": f"{api_host}/job/{document_id}/{job_string}"
        })
        response = requests.post(f"{settings.OCR_URL}/{document_id}", data=payload)
        if response.status_code != 200:
            return False
    # Else process all documents from local worker (local OCR)
    else:
        logging.info("Using local full_document_process")
        context = {
            "document_id": document_id,
            "s3_url": pdf_s3_url
        }

        full_document_process(context)

        return True
