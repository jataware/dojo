from __future__ import annotations

import time
import re
import uuid
from datetime import datetime
from typing import Any, Dict, Generator, List, Optional
from urllib.parse import urlparse
from elasticsearch import Elasticsearch
from elasticsearch.exceptions import RequestError
from fastapi import (
    APIRouter,
    HTTPException,
    Response,
    status,
    UploadFile,
    File,
    Request,
    Query,
)
from fastapi.responses import FileResponse
from fastapi.logger import logger

import os
import json

from validation import DocumentSchema
from src.settings import settings

from src.utils import put_rawfile, get_rawfile
from src.urls import clean_and_decode_str

from rq import Queue
from redis import Redis
from rq.exceptions import NoSuchJobError
from rq import job

from src.embedder_engine import embedder
from src.semantic_highlighter import highlighter

from pydantic import BaseModel


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


class HighlightData(BaseModel):
    query: str
    matches: list[str]

class HighlightResponseModel(BaseModel):
    highlights: List[List[DocumentSchema.Highlight]]

@router.post(
    "/paragraphs/highlight", response_model=HighlightResponseModel
)
def semantic_highlight_paragraphs(payload: HighlightData):

    data = payload.dict()

    clean_query = clean_and_decode_str(data["query"])

    highlights = highlighter.highlight_multiple(clean_query, data["matches"])

    return {
        "highlights": highlights
    }


@router.get(
    "/paragraphs/search", response_model=DocumentSchema.ParagraphSearchResponse
)
def semantic_search_paragraphs(query: str,
                               scroll_id: Optional[str]=None,
                               highlight: Optional[bool]=False,
                               size: int = 10):
    """
    Uses query to perform a Semantic Search on paragraphs; where LLM embeddings
    are used to compare a text query to items stored.
    """

    clean_query = clean_and_decode_str(query)

    if scroll_id:
        results = es.scroll(scroll_id=scroll_id, scroll="2m")
    else:
        # Retrieve first item in output, since it accepts an array and returns
        # an array, and we provided only one item (query)
        query_embedding = embedder.embed([clean_query])[0]

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

    hits = results["hits"]["hits"]

    if highlight:
        text_vec = list(map(lambda x: x.get('_source').get('text'), hits))
        highlights = highlighter.highlight_multiple(clean_query, text_vec)

    result_len = len(hits)

    if result_len < size:
        scroll_id = None
    else:
        scroll_id = results.get("_scroll_id", None)

    max_score = results["hits"]["max_score"]

    def formatOneResult(r, index):
        r["_source"]["metadata"] = {}
        r["_source"]["metadata"]["match_score"] = r["_score"]
        r["_source"]["id"] = r["_id"]

        if highlight:
            r["_source"]["highlights"] = highlights[index]

        return r["_source"]

    return {
        "hits": results["hits"]["total"]["value"],
        "items_in_page": result_len,
        "max_score": max_score,
        "results": [formatOneResult(item, index) for index, item in enumerate(hits)],
        "scroll_id": scroll_id
    }


@router.get(
    "/paragraphs/{paragraph_id}", response_model=DocumentSchema.Paragraph
)
def get_paragraph(paragraph_id: str):
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

# NOTE Dart Paper metadata may contain PascalCase attributes. We strive to use
# snake_case both in DB and API. Converting functions follow. No harm  if
# already as snake_case.

def camel_to_snake(str):
    """Receives a lowercase, snake_case, camelCase, or PascalCase input string
    and returns it as snake_case. In the case of snake_case input, no
    transformation occurs.
    """
    return re.sub(r'(?<!^)(?=[A-Z])', '_', str).lower()


def dict_keys_to_snake_case(a_dict):
    return {camel_to_snake(k): v for k, v in a_dict.items()}


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
    "/documents/latest", response_model=DocumentSchema.DocumentListResponse
)
def latest_documents(scroll_id: Optional[str] = None, size: int = 10):
    """
    """

    q = {
        "query": {
            "match_all": {}
        },
        "sort": [
            {
                "uploaded_at": {
                    "order": "desc"
                }
            }
        ]
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
    "/documents", response_model=DocumentSchema.DocumentListResponse
)
def list_documents(
    scroll_id: Optional[str] = None,
    size: int = 10,
    sort_by: Optional[str] = Query("creation_date", description="Field to sort by"),
    order: Optional[str] = Query("desc", description="Order to sort by")
):
    """
    Retrieves all stored documents, regardless of files uploaded or processed.
    `sort_by` and `order` params return sorted results.
    """

    if order not in ["asc", "desc"]:
        raise HTTPException(status_code=400, detail="Invalid sort order. Must be either 'asc' or 'desc'")

    # Apply .keyword to the fields with keyword mappings
    if sort_by in ["type", "description", "original_language", "classification", "producer", "stated_genre"]:
        sort_by += ".keyword"

    if sort_by in ["title", "publisher"]:
        sort_by += ".lowersortable"

    q = {
        "query": {
            "match_all": {}
        },
        "sort": [
            {
                sort_by: {
                    "order": order
                }
            }
        ]
    }

    try:
        if not scroll_id:
            results = es.search(index="documents", body=q, scroll="2m", size=size)
        else:
            results = es.scroll(scroll_id=scroll_id, scroll="2m")
    except RequestError as e:
        raise HTTPException(status_code=400, detail=str(e))

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
    "/documents/search", response_model=DocumentSchema.DocumentListResponse
)
def search_documents(
        query: str,
        scroll_id: Optional[str]=None,
        sort_by: Optional[str] = Query("creation_date", description="Field to sort by"),
        order: Optional[str] = Query("desc", description="Order to sort by"),
        size: int = 10,
):

    if scroll_id:
        documents = es.scroll(scroll_id=scroll_id, scroll="2m")
    else:

        if order not in ["asc", "desc"]:
            raise HTTPException(status_code=400, detail="Invalid sort order. Must be either 'asc' or 'desc'")

        if sort_by in ["type", "description", "original_language", "classification", "producer", "stated_genre"]:
            sort_by += ".keyword"

        if sort_by in ["title", "publisher"]:
            sort_by += ".lowersortable"

        q = {
            "query": {
                "bool": {
                    "should": [
                        {
                            "match_phrase": {
                                "title": {
                                    "query": query,
                                    "_name": "title"
                                }
                            }
                        },
                        {
                            "match_phrase": {
                                "description": {
                                    "query": query,
                                    "_name": "keyword_display_name"
                                }
                            }
                        },
                    ]
                }
            },
            "sort": [
                {
                    sort_by: {
                        "order": order
                    }
                }
            ]
        }

        documents = es.search(index="documents", body=q, size=size, scroll="2m")

    totalDocsInPage = len(documents["hits"]["hits"])

    if totalDocsInPage < size:
        scroll_id = None
    else:
        scroll_id = documents.get("_scroll_id", None)

    return {
        "hits": documents["hits"]["total"]["value"],
        "items_in_page": totalDocsInPage,
        "scroll_id": scroll_id,
        "results": [{**i["_source"], "id": i["_id"]} for i in documents["hits"]["hits"]]
    }


@router.get(
    "/documents/{document_id}/paragraphs", response_model=DocumentSchema.DocumentTextResponse
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
                    "match": {"document_id": document_id}
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
    "/documents/{document_id}", response_model=DocumentSchema.Model
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


@router.post("/documents")
def create_document(payload: DocumentSchema.CreateModel):
    """
    Saves a document [metadata] into elasticsearch
    """
    document_id = str(uuid.uuid4())

    payload_dict = DEFAULT_DOC | payload.dict()

    try:  # Delete id if present, else ignore.
        del payload_dict["id"]
    except KeyError:
        pass

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
def update_document(payload: DocumentSchema.CreateModel, document_id: str):
    """
    Partially updates a document. Accepts a full object as well.
    """

    payload_dict = payload.dict(exclude_unset=True)

    if payload_dict:
        es.update(index="documents", body={"doc": payload_dict}, id=document_id)
    else:
        return Response(
            status_code=status.HTTP_400_BAD_REQUEST,
            headers={
                "location": f"/api/documents/{document_id}",
                "content-type": "application/json",
            },
            content=json.dumps({"error": f"Could not update Document with id={document_id}, invalid or unknown update attributes were provided"})
        )

    return Response(
        status_code=status.HTTP_200_OK,
        headers={
            "location": f"/api/documents/{document_id}",
            "content-type": "application/json",
        },
        content=json.dumps({"result": f"Updated document with id = {document_id}"})
    )


def enqueue_document_paragraphs_processing(document_id, s3_url):
    """
    Adds document to queue to process by paragraph.
    Embedder creates and attaches LLM embeddings to its paragraphs
    """
    job_string = "paragraph_embeddings_processors.calculate_store_embeddings"
    job_id = f"{document_id}_{job_string}"

    context = {
        "document_id": document_id,
        "s3_url": s3_url
    }

    job = q.enqueue_call(
        func=job_string, args=[context], kwargs={}, job_id=job_id
    )


# TODO should we only allow 1 file per document id? replace? cancel/error?
@router.post("/documents/{document_id}/upload")
def upload_file(
    document_id: str,
    file: UploadFile = File(...),
):
    """
    Uploads a file that corresponds to an existing document resource.
    """
    original_filename = file.filename
    _, ext = os.path.splitext(original_filename)

    dest_path = os.path.join(settings.DOCUMENT_STORAGE_BASE_URL, f"{document_id}-{original_filename}")
    put_rawfile(path=dest_path, fileobj=file.file)

    body_updates = {
        "doc": {
            "uploaded_at": current_milli_time(),
            "source_url": dest_path,
            "filename": original_filename
        }
    }

    es.update(index="documents", body=body_updates, id=document_id)

    # enqueue for rq worker to add paragraphs and embeddings to es
    enqueue_document_paragraphs_processing(document_id, dest_path)

    final_document = es.get_source(index="documents", id=document_id)

    return Response(
        status_code=status.HTTP_200_OK,
        headers={
            "location": f"/api/documents/{document_id}",
            "content-type": "application/json",
        },
        content=json.dumps({"id": document_id}|final_document),
    )


@router.get("/documents/{document_id}/file")
def get_document_uploaded_file(document_id: str):
    """
    Downloads the original file (PDF) of an uploaded document.
    """
    document = es.get_source(index="documents", id=document_id)

    try:
        s3_url = document["source_url"]
        file_name = document["filename"]
    except KeyError as e:
        logger.error(e)
        return Response(
            status_code=status.HTTP_400_BAD_REQUEST,
            headers={"msg": f"Error: {e}"},
            content=json.dumps({"error": "Document has no uploaded source file."})
        )

    file = get_rawfile(path=s3_url)

    headers = {'Content-Disposition': f'inline; filename="{file_name}"'}

    return Response(content=file.read(), media_type="application/pdf", headers=headers)
