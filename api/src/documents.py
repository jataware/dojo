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

from validation import IndicatorSchema, DojoSchema, MetadataSchema
from src.settings import settings

from validation.IndicatorSchema import (
    IndicatorMetadataSchema,
    QualifierOutput,
    Output,
    Period
)

from src.utils import put_rawfile, get_rawfile, list_files
from src.datasearch.corpora import Corpus
from src.search.bert_search import BertSentenceSearch

router = APIRouter()

es = Elasticsearch([settings.ELASTICSEARCH_URL], port=settings.ELASTICSEARCH_PORT)

# Initialize LLM Semantic Search Engine. Requires a corpus on instantiation
# for now. We'll refactor the embedder engine once out of PoC stage.
corpus = Corpus.from_list(["a"])
engine = BertSentenceSearch(corpus, cuda=False)


def formatHitWithId(hit):
    return {
        **hit["_source"],
        "id": hit["_id"]
    }


@router.get(
    "/paragraphs"  # , response_model=IndicatorSchema.FeaturesSearchSchema
)
def list_paragraphs(scroll_id: Optional[str]=None, size: int = 10):
    """
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
        "items_in_page": totalDocsInPage,
        "scroll_id": scroll_id,
        "results": [formatHitWithId(i) for i in results["hits"]["hits"]]
    }


@router.get(
"/paragraphs/search"
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
        query_embedding = engine.embed_query(query)

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
                                        "query_vector": query_embedding.tolist()
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
        r["_source"]["score"] = r["_score"]
        r["_source"]["id"] = r["_id"]
        return r["_source"]

    return {
        "items_in_page": result_len,
        "scroll_id": scroll_id,
        "max_score": max_score,
        "results": [formatOneResult(i) for i in results["hits"]["hits"]],
    }


@router.get(
    "/paragraphs/{paragraph_id}"
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


def camel_to_snake(str):
    """Receives a lowercase, camelCase, or PascalCase input string
    and returns it as snake_case"""
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
    "stated_genre": ""
}

def format_document(doc):
    """
    """
    return DEFAULT_DOC|dict_keys_to_snake_case(formatHitWithId(doc))

@router.get(
    "/documents"
)
def list_documents(scroll_id: Optional[str]=None, size: int = 10):
    """
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
        "items_in_page": totalDocsInPage,
        "scroll_id": scroll_id,
        "results": [format_document(i)
                    for i in results["hits"]["hits"]]
    }

@router.get(
    "/documents/{document_id}/text"
)
def get_document_text(document_id: str,
                      scroll_id: Optional[str] = None,
                      size: int = 10):
    """
    Returns a document's text, where each entry is separated by newline.
    """
    if not scroll_id:
        try:
            q = {
                "query": {
                    "term": {"document_id": document_id}
                },
                "_source": ["text"]
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
        "items_in_page": totalDocsInPage,
        "scroll_id": scroll_id,
        "text": [i["_source"] for i in paragraphs["hits"]["hits"]],
    }


@router.get(
    "/documents/{document_id}"  # , response_model=IndicatorSchema.IndicatorMetadataSchema
)
def get_document(document_id: str): # -> IndicatorSchema.IndicatorMetadataSchema:
    """
    """
    try:
        document = es.get(index="documents", id=document_id)
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return format_document(document)

def current_milli_time():
    return round(time.time() * 1000)

@router.post("/documents")
def create_document(payload):
    """
    """
    document_id = str(uuid.uuid4())
    payload.id = document_id
    payload.created_at = current_milli_time()
    body = payload.json()

    es.index(index="documents", body=body, id=document_id)

    return Response(
        status_code=status.HTTP_201_CREATED,
        headers={
            "location": f"/api/documents/{document_id}",
            "content-type": "application/json",
        },
        content=body,
    )


@router.post("/documents/{document_id}/upload")
def upload_file(
    document_id: str,
    file: UploadFile = File(...),
    filename: Optional[str] = None,
    append: Optional[bool] = False,
):
    """
    TODO- Do we upload after creating the id? How do we do this on datasets?
    TODO Which bucket should we upload to
    """
    original_filename = file.filename
    _, ext = os.path.splitext(original_filename)
    dir_path = os.path.join(settings.DATASET_STORAGE_BASE_URL, document_id)
    if filename is None:
        if append:
            filenum = len(
                [
                    f
                    for f in list_files(dir_path)
                    if f.startswith("raw_data") and f.endswith(ext)
                ]
            )
            filename = f"raw_data_{filenum}{ext}"
        else:
            filename = f"raw_data{ext}"

    # Upload file
    dest_path = os.path.join(settings.DATASET_STORAGE_BASE_URL, document_id, filename)
    put_rawfile(path=dest_path, fileobj=file.file)

    return Response(
        status_code=status.HTTP_201_CREATED,
        headers={
            "location": f"/api/indicators/{document_id}",
            "content-type": "application/json",
        },
        content=json.dumps({"id": document_id, "filename": filename}),
    )
