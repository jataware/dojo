from __future__ import annotations

import time
import re
import uuid
from datetime import datetime
from typing import Any, Dict, Generator, List, Optional
from urllib.parse import urlparse
from elasticsearch import Elasticsearch
from fastapi import (
    APIRouter,
    HTTPException,
    Response,
    status,
    UploadFile,
    File,
    Request,
)
from fastapi.logger import logger

import os
import json

from validation import DocumentSchema
from src.settings import settings

from src.utils import put_rawfile  # , get_rawfile, list_files

from rq import Queue
from redis import Redis
from rq.exceptions import NoSuchJobError
from rq import job

from src.embedder_engine import embedder

router = APIRouter()

es = Elasticsearch([settings.ELASTICSEARCH_URL], port=settings.ELASTICSEARCH_PORT)

# REDIS CONNECTION AND QUEUE OBJECTS
redis = Redis(
    os.environ.get("REDIS_HOST", "redis.dojo-stack"),
    int(os.environ.get("REDIS_PORT", 6379)),
)
q = Queue(connection=redis, default_timeout=-1)


def current_milli_time():
    return round(time.time() * 1000)


def formatHitWithId(hit):
    return {
        **hit["_source"],
        "id": hit["_id"]
    }


@router.get(
    "/paragraphs", response_model=DocumentSchema.ParagraphListResponse
)
def list_paragraphs(scroll_id: Optional[str]=None, size: int = 10):
    """
    Returns listings of all stored paragraphs with no filters. Defaults
    pagination to 10 items per page (size).
    """

    q = {
        "query": {
            "match_all": {}
        },
        "_source": {
            "excludes": ["embeddings"]
        }
    }

    if not scroll_id:
        results = es.search(index="document_paragraphs",
                            body=q,
                            scroll="2m",
                            size=size)
    else:
        results = es.scroll(scroll_id=scroll_id, scroll="2m")

    totalDocsInPage = len(results["hits"]["hits"])

    if totalDocsInPage < size:
        scroll_id = None
    else:
        scroll_id = results.get("_scroll_id", None)

    return {
        "hits": results["hits"]["total"]["value"],
        "items_in_page": totalDocsInPage,
        "scroll_id": scroll_id,
        "results": [{"id": i["_id"]}|i["_source"] for i in results["hits"]["hits"]]
    }


@router.get(
    "/paragraphs/search", response_model=DocumentSchema.ParagraphSearchResponse
)
def semantic_search_paragraphs(query: str,
                               scroll_id: Optional[str]=None,
                               size: int = 10):
    """
    Uses query to perform a Semantic Search on paragraphs; where LLM embeddings
    are used to compare a text query to items stored.
    """
    if scroll_id:
        results = es.scroll(scroll_id=scroll_id, scroll="2m")
    else:
        # Retrieve first item in output, since it accepts an array and returns
        # an array, and we provided only one item (query)
        query_embedding = embedder.embed([query])[0]

        MIN_TEXT_LENGTH_THRESHOLD = 100

        p_query = {
            "query": {
                "bool": {
                    "must": [
                        {
                            "script_score": {
                                "query": {"match_all": {}},
                                "script": {
                                    # ES doesnt allow negative numbers. We can either:
                                    # - a) clamp at 0, and not allow negatives, or
                                    # - b) Add 1 to the result to compare score
                                    # We use option (a): it has better score % for top results
                                    "source": "Math.max(cosineSimilarity(params.query_vector, 'embeddings'), 0)",
                                    "params": {
                                        "query_vector": query_embedding
                                    }
                                }
                            }
                        }
                    ],
                    "filter": [
                        {
                            "range": {
                                "length": {
                                    "gte": MIN_TEXT_LENGTH_THRESHOLD
                                }
                            }
                        }
                    ]
                }
            },
            "_source": {
                "excludes": ["embeddings"]
            }
        }

        results = es.search(index="document_paragraphs",
                            body=p_query,
                            scroll="2m",
                            size=size)

    result_len = len(results["hits"]["hits"])

    if result_len < size:
        scroll_id = None
    else:
        scroll_id = results.get("_scroll_id", None)

    max_score = results["hits"]["max_score"]

    def formatOneResult(r):
        r["_source"]["metadata"] = {}
        r["_source"]["metadata"]["match_score"] = r["_score"]
        r["_source"]["id"] = r["_id"]
        return r["_source"]

    return {
        "hits": results["hits"]["total"]["value"],
        "items_in_page": result_len,
        "max_score": max_score,
        "results": [formatOneResult(i) for i in results["hits"]["hits"]],
        "scroll_id": scroll_id
    }


@router.get(
    "/paragraphs/{paragraph_id}"
)
def get_paragraph(paragraph_id: str) -> DocumentSchema.Paragraph:
    """
    """
    try:
        p = es.get_source(index="document_paragraphs",
                          id=paragraph_id,
                          _source_excludes=["embeddings"])
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return {**p, "id": paragraph_id}

# NOTE Dart Paper data contains PascaCase attributes. We strive to use
# snake_case both in DB and API. Converting functions follow.

def camel_to_snake(str):
    """Receives a lowercase, snake_case, camelCase, or PascalCase input string
    and returns it as snake_case. In the case of snake_case input, no
    transformation occurs.
    """
    return re.sub(r'(?<!^)(?=[A-Z])', '_', str).lower()


def dict_keys_to_snake_case(a_dict):
    return {camel_to_snake(k): v for k, v in a_dict.items()}

# NOTE decided against the following functions on document create:
# New documents will always be stored to snake_case, and DART documents
# potentially uploaded as snake_case if need be, in the future.
# def snake_to_pascal(str):
#     x = str.split("_")
#     return "".join([i.title() for i in x])

# def dict_keys_to_pascal(a_dict):
#     return {snake_to_pascal(k): v for k, v in a_dict.items()}

DEFAULT_DOC = {
    "creation_date": None,
    "mod_date": None,
    "type": "article",
    "description": "",
    "original_language": "",
    "classification": "UNCLASSIFIED",
    "title": "",
    "producer": "",
    "stated_genre": "",
    "uploaded_at": None,
    "processed_at": None
}


# Pseudo-temporary helper while we ensure that all documents contain consistent
# attributes when uploaded (even with null values).
def format_document(doc):
    """
    Receives elasticsearch response `document` input, merges with Default doc,
    ensures to snake_case, and formats with added id from es doc response.
    """
    return DEFAULT_DOC|dict_keys_to_snake_case(formatHitWithId(doc))


@router.get(
    "/documents", response_model=DocumentSchema.DocumentListResponse
)
def list_documents(scroll_id: Optional[str]=None, size: int = 10):
    """
    Retrieves all stored documents, regardless of files uploaded or processed.
    """

    q = {
        "query": {
            "match_all": {}
        }
    }

    if not scroll_id:
        results = es.search(index="documents", body=q, scroll="2m", size=size)
    else:
        results = es.scroll(scroll_id=scroll_id, scroll="2m")

    totalDocsInPage = len(results["hits"]["hits"])

    if totalDocsInPage < size:
        scroll_id = None
    else:
        scroll_id = results.get("_scroll_id", None)

    return {
        "hits": results["hits"]["total"]["value"],
        "items_in_page": totalDocsInPage,
        "results": [format_document(i)
                    for i in results["hits"]["hits"]],
        "scroll_id": scroll_id
    }


@router.get(
    "/documents/{document_id}/paragraphs"
)
def get_document_text(document_id: str,
                      scroll_id: Optional[str] = None,
                      size: int = 10):
    """
    Returns a document's text, where each entry is a paragraph. Paragraphs are
    defined as any extracted text within the document ending with a newline.
    """
    if not scroll_id:
        try:
            q = {
                "query": {
                    "term": {"document_id": document_id}
                },
                "_source": {"excludes": ["embeddings"]}
            }
            # Get all the paragraphs for the document, ordered by indexed order
            #  (should follow paragraph order).
            paragraphs = es.search(index="document_paragraphs", body=q, size=size, scroll="2m")
        except Exception as e:
            logger.exception(e)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    else:
        paragraphs = es.scroll(scroll_id=scroll_id, scroll="2m")

    totalDocsInPage = len(paragraphs["hits"]["hits"])

    if totalDocsInPage < size:
        scroll_id = None
    else:
        scroll_id = paragraphs.get("_scroll_id", None)

    return {
        "hits": paragraphs["hits"]["total"]["value"],
        "items_in_page": totalDocsInPage,
        "scroll_id": scroll_id,
        "paragraphs": [{**i["_source"], "id": i["_id"]} for i in paragraphs["hits"]["hits"]]
    }


@router.get(
    "/documents/{document_id}"
)
def get_document(document_id: str) -> DocumentSchema.Model:
    """
    """
    try:
        document = es.get(index="documents", id=document_id)
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return format_document(document)


# TODO GET documents/latest properly implement
@router.get(
    "/documents/latest", response_model=DocumentSchema.DocumentListResponse
)
def latest_documents(scroll_id: Optional[str]=None, size: int = 10):
    """
    Same as list documents. Not Implemented.
    """

    q = {
        "query": {
            # TODO sort by most recently uploaded_at
            "match_all": {}
        }
    }

    if not scroll_id:
        results = es.search(index="documents", body=q, scroll="2m", size=size)
    else:
        results = es.scroll(scroll_id=scroll_id, scroll="2m")

    totalDocsInPage = len(results["hits"]["hits"])

    if totalDocsInPage < size:
        scroll_id = None
    else:
        scroll_id = results.get("_scroll_id", None)

    return {
        "hits": results["hits"]["total"]["value"],
        "items_in_page": totalDocsInPage,
        "results": [format_document(i)
                    for i in results["hits"]["hits"]],
        "scroll_id": scroll_id
    }


@router.post("/documents")
def create_document(payload: DocumentSchema.Model):
    """
    """
    document_id = str(uuid.uuid4())

    payload_dict = DEFAULT_DOC | payload.dict()

    try:  # Delete id if present, else ignore.
        del payload_dict["id"]
    except KeyError:
        pass

    # TODO verify if necessary to use dictionary or to_json
    body = json.dumps(payload_dict)

    es.index(index="documents", body=body, id=document_id)

    return Response(
        status_code=status.HTTP_201_CREATED,
        headers={
            "location": f"/api/documents/{document_id}",
            "content-type": "application/json",
        },
        # Already contains default doc
        content=json.dumps({'id' : document_id}|payload_dict)
    )


@router.patch("/documents/{document_id}")
def update_document(payload: DocumentSchema.Model, document_id: str):
    """
    Partially updates a document. Accepts a full object as well.
    """

    payload_dict = payload.dict(exclude_unset=True)

    logger.info(f"update payload: {payload_dict}")

    try:  # Delete id if present, else ignore.
        del payload_dict["id"]
    except KeyError:
        pass

    es.update(index="documents", body={"doc": payload_dict}, id=document_id)

    return Response(
        status_code=status.HTTP_200_OK,
        headers={
            "location": f"/api/documents/{document_id}",
            "content-type": "application/json",
        },
        content={result: f"Updated document with id = {document_id}"}
    )


# TODO make proper call, use, and try it out
def enqueue_document_paragraphs_processing(document_id, s3Url):
    """
    Adds document to queue to process by paragraph.
    Embedder creates and attaches LLM embeddings to its paragraphs
    """
    job_string = "paragraph_embeddings_processors.calculate_store_embeddings"
    job_id = f"{document_id}_{job_string}"

    context = {
        "document_id": indicator_id,
        "s3_url": s3Url
    }

    job = q.enqueue_call(
        func=job_string, args=[context], kwargs={}, job_id=job_id
    )


# TODO should we only allow 1 file per document id?
@router.post("/documents/{document_id}/upload")
def upload_file(
    document_id: str,
    file: UploadFile = File(...),
    filename: Optional[str] = None,
    append: Optional[bool] = False,
):
    """
    Uploads a file that corresponds to an existing document resource.
    """
    original_filename = file.filename
    _, ext = os.path.splitext(original_filename)

    if filename is None:
        filename = f"raw_data{ext}"

    # TODO settings.DOCUMENT_STORAGE_BASE_URL -> why isn't this working?

    # Upload file, TODO test this
    dest_path = os.path.join("s3://jataware-world-modelers-dev/documents/", f"{document_id}-{filename}")
    logger.info(f"file upload dest_path: {dest_path}")
    put_rawfile(path=dest_path, fileobj=file.file)

    # TODO update document data id to include source_url pointing to new s3 url dest_path above.
    # TODO update document metadata to include uploaded_at once upload is successful
    # es will have flat structure, API will respond with nested `metadata` attributes

    # TODO enqueue for rq worker to add paragraphs and embeddings to es
    # enqueue_document_paragraphs_processing(document_id, dest_path)

    return Response(
        status_code=status.HTTP_200_OK,
        headers={
            "location": f"/api/documents/{document_id}",
            "content-type": "application/json",
        },
        # TODO Actually, let's return the new document with the source_url in it
        content=json.dumps({"id": document_id, "filename": filename}),
    )
