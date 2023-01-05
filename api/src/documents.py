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

from validation import IndicatorSchema, DojoSchema, MetadataSchema
from src.settings import settings

# from src.dojo import search_and_scroll

from validation.IndicatorSchema import (
    IndicatorMetadataSchema,
    QualifierOutput,
    Output,
    Period
)

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
def list_paragraphs(scroll_id: Optional[str]=None):
    """
    """

    size = 10

    q = {
        "query": {
            "match_all": {}
        },
        "_source": {
            "excludes": ["embeddings"]
        }
    }

    if not scroll_id:
        results = es.search(index="document_paragraphs", body=q, scroll="2m", size=size)
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
def semantic_search_paragraphs(query: str, scroll_id: Optional[str]=None):
    """
    Uses query to perform a fuzzy search on paragraphs. These paragraphs belog
    to DART documents. Our fuzzy search is also referred to as semantic search,
    where we use LLM embeddings to compare a query to items stored.
    """

    # print(f"searching paragrpahs with query: '{query}'")

    size = 20 # TODO change later

    query_embedding = engine.embed_query(query)

    p_query = {
        "query": {
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
        },
        "_source": {
            "excludes": ["embeddings"]
        }
    }

    results = es.search(index="document_paragraphs", body=p_query, scroll="2m", size=size)

    result_len = len(results["hits"]["hits"])

    # print(f"result lenght: {result_len}")

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
        # "hits": results["hits"]["total"]["value"],
        "items_in_page": result_len,
        "scroll_id": scroll_id,
        "max_score": max_score,
        "results": [formatOneResult(i) for i in results["hits"]["hits"]],
    }


@router.get(
    "/paragraphs/{paragraph_id}"  # , response_model=IndicatorSchema.IndicatorMetadataSchema
)
def get_paragraph(paragraph_id: str): # -> IndicatorSchema.IndicatorMetadataSchema:
    """
    """

    # print(f"get paragraph_id: {paragraph_id}")

    try:
        p = es.get(index="document_paragraphs", id=paragraph_id)
        # print(f"p  result of get p by id is {p}")
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return formatHitWithId(p)


def camel_to_snake(str):
    """Receives a lowercase, camelCase, or PascalCase input string
    and returns it as snake_case"""
    return re.sub(r'(?<!^)(?=[A-Z])', '_', str).lower()


def dict_keys_to_snake_case(a_dict):
    return {camel_to_snake(k): v for k, v in a_dict.items()}


# TODO merge with response = DEFAULTDOC|result to always contain all keys
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
    # "id": "7be23e5cb2b7b2eb1b03f4997068df7c"
}

def format_document(doc):
    """
    TODO use
    """
    return DEFAULT_DOC|dict_keys_to_snake_case(formatHitWithId(doc))

@router.get(
    "/documents"
)
def list_documents(scroll_id: Optional[str]=None):
    """
    """

    size = 20

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
"/documents/search"
)
def semantic_search_documents(query: str, scroll_id: Optional[str]=None):
    """
    TODO
    """
    results_dict = semantic_search_paragraphs(query)

    # print(f"results of search p in doc: {results_dict}")

    p = results_dict["results"]

    all_docs = []

    for r in p:
        doc = get_document(r["document_id"])
        doc["match_paragraph_id"] = r["id"]

        # print(f" found doc from p res: {doc}\n\n")

        all_docs.append(doc)

    return all_docs


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
