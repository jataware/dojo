from __future__ import annotations

# import csv
# import io
# import re
import time
# import zlib
import uuid
from datetime import datetime
from typing import Any, Dict, Generator, List, Optional
from urllib.parse import urlparse

# import json
# import pandas as pd

from elasticsearch import Elasticsearch

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    Response,
    status,
    UploadFile,
    File,
    Request,
)
from fastapi.logger import logger
from fastapi.responses import StreamingResponse

from validation import IndicatorSchema, DojoSchema, MetadataSchema
from src.settings import settings

from src.dojo import search_and_scroll

from validation.IndicatorSchema import (
    IndicatorMetadataSchema,
    QualifierOutput,
    Output,
    Period
    # Geography
    # FeaturesSearchSchema
)
# from functools import reduce
# import os

from src.datasearch.corpora import Corpus
from src.search.bert_search import BertSentenceSearch

router = APIRouter()

es = Elasticsearch([settings.ELASTICSEARCH_URL], port=settings.ELASTICSEARCH_PORT)


# For created_at times in epoch milliseconds
# def current_milli_time():
#     """Return milli time now."""
#     return round(time.time() * 1000)


# Initialize LLM Semantic Search Engine. Requires a corpus on instantiation
# for now. We'll refactor the embedder engine once out of PoC stage.
corpus = Corpus.from_list(["a"])
engine = BertSentenceSearch(corpus, cuda=False)


@router.get(
"/paragraphs/search"
)
def semantic_search_paragraphs(query: str, scroll_id: Optional[str]=None):
    """
    Uses query to perform a fuzzy search on paragraphs. These paragraphs belog
    to DART documents. Our fuzzy search is also referred to as semantic search,
    where we use LLM embeddings to compare a query to items stored.
    """

    size = 20

    query_embedding = engine.embed_query(query)

    p_query = {
        "query": {
            "script_score": {
                "query": {"match_all": {}},
                "script": {
                    "source": "Math.max(cosineSimilarity(params.query_vector, 'embeddings'), 0)",
                    "params": {
                        "query_vector": query_embedding.tolist()
                    }
                }
            }
        },
        "_source": {
            "excludes": ["embeddings"]
        }
    }

    results = es.search(index="document_paragraphs", body=p_query, scroll="2m", size=size)

    if len(results["hits"]["hits"]) < size:
        scroll_id = None
    else:
        scroll_id = results.get("_scroll_id", None)

    max_score = results["hits"]["max_score"]

    results["hits"]["hits"] # | ["_source"] ["_score"] ;; add score property to object

    def formatOneResult(r):
        r["_source"]["_score"] = r["_score"]
        r["_source"]["id"] = r["_id"]
        return r["_source"]

    return {
        "hits": results["hits"]["total"]["value"],
        "items_in_page": len(results["hits"]["hits"]),
        "scroll_id": scroll_id,
        "max_score": max_score,
        "results": [formatOneResult(i) for i in results["hits"]["hits"]],
    }


@router.get(
    "/paragraphs"  # , response_model=IndicatorSchema.FeaturesSearchSchema
)
def list_paragraphs(scroll_id: Optional[str]=None):
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
        results = es.search(index="document_paragraphs", body=q, scroll="2m", size=10)
    else:
        results = es.scroll(scroll_id=scroll_id, scroll="2m")

    # These are document hits (es parent indicators) in current page
    # The final response items_in_page property will group features within
    # these indicators (will be more than indicator count)
    totalDocsInPage = len(results["hits"]["hits"])

    # if results are less than the page size (10) don't return a scroll_id
    if totalDocsInPage < 10:
        scroll_id = None
    else:
        scroll_id = results.get("_scroll_id", None)

    # Groups features as array list from `results`, into `response`
    # response = reduce(outputs_as_features, results["hits"]["hits"], [])

    def formatParagraph(res):
        return {
            **res["_source"],
            "id": res["_id"]
        }

    return {
        "items_in_page": totalDocsInPage,
        "scroll_id": scroll_id,
        "results": [formatParagraph(i) for i in results["hits"]["hits"]]
    }


@router.get(
    "/paragraphs/{paragraph_id}"  # , response_model=IndicatorSchema.IndicatorMetadataSchema
)
def get_paragraph(paragraph_id: str): # -> IndicatorSchema.IndicatorMetadataSchema:
    """
    TODO this is returning 404
    """
    try:
        p = es.get(index="document_paragraphs", id=paragraph_id)
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return {
        **p["_source"],
        "id": p["_id"]
    }


@router.get(
    "/documents"
)
def list_documents(scroll_id: Optional[str]=None):
    """
    """
    q = {
        "query": {
            "match_all": {}
        }
    }

    if not scroll_id:
        # we need to kick off the query
        results = es.search(index="documents", body=q, scroll="2m", size=10)
    else:
        # otherwise, we can use the scroll
        results = es.scroll(scroll_id=scroll_id, scroll="2m")

    # These are document hits (es parent indicators) in current page
    # The final response items_in_page property will group features within
    # these indicators (will be more than indicator count)
    totalDocsInPage = len(results["hits"]["hits"])

    # if results are less than the page size (10) don't return a scroll_id
    if totalDocsInPage < 10:
        scroll_id = None
    else:
        scroll_id = results.get("_scroll_id", None)

    # Groups features as array list from `results`, into `response`
    # response = reduce(outputs_as_features, results["hits"]["hits"], [])

    def formatDocument(res):
        return {
            **res["_source"],
            "id": res["_id"]
        }

    return {
        "items_in_page": totalDocsInPage,
        "scroll_id": scroll_id,
        "results": [formatDocument(i) for i in results["hits"]["hits"]]
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
    return {
        **document["_source"],
        "id": document["_id"]
    }


