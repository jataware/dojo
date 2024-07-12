
from __future__ import annotations

import time
from typing import Optional, Literal
from elasticsearch import Elasticsearch
# from elasticsearch.exceptions import RequestError, NotFoundError
from fastapi import (
    APIRouter,
    HTTPException,
    # Response,
    status,
    # UploadFile,
    # File,
    # Request,
    # Query,
)

from dataclasses import asdict
from fastapi.logger import logger
import os
import json
# from enum import Enum

# from validation import DocumentSchema
from src.settings import settings

from rq import Queue
from redis import Redis

from sse_starlette.sse import EventSourceResponse, ServerSentEvent
from src.causal_recommender import CausalRecommender
from jatarag.agent import OpenAIAgent
from jatarag.librarian import synthesize_answer, MultihopRagAgent
from jatarag.db import Database, ParagraphResult, MetadataResult
from jatarag.embedder import Embedder, AdaEmbedder
from pydantic import BaseModel
from pathlib import Path
from os.path import join as path_join
from validation.KnowledgeSchema import (
    CausesResponse,
    EffectsResponse,
    RecommenderFullResponse
)


class ElasticSearchDB(Database):
    def __init__(self, embedder: Embedder):
        self.embedder = embedder
        self.es = Elasticsearch([settings.ELASTICSEARCH_URL], port=settings.ELASTICSEARCH_PORT)
        self.PARAGRAPHS_INDEX = "document_paragraphs"
        self.DOCUMENTS_INDEX = "documents"

    def query_all_documents(self, query: str, max_results: int = 10) -> list[ParagraphResult]:
        """perform a search over all document paragraphs in the database for the given query"""
        # embed the query
        query_embedding = self.embedder.embed_paragraphs([query])[0]

        # elasticsearch cosine similarity over all online documents
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
                            "query_vector": query_embedding
                        }
                    }
                }
            },
            "_source": {
                "excludes": ["embeddings"]
            }
        }
        results = self.es.search(
            index=self.PARAGRAPHS_INDEX,
            body=p_query,
            size=max_results
        )
        hits = results["hits"]["hits"]

        # Convert the elastic search results to ParagraphResult objects
        return [self.format_paragraph_result(r) for r in hits]

    def query_single_document(self, document_id: str, query: str, max_results: int = 10) -> list[ParagraphResult]:
        """perform a search over a single document in the database for the given query"""
        # embed the query
        query_embedding = self.embedder.embed_paragraphs([query])[0]

        # elasticsearch cosine similarity over the specified document
        p_query = {
            "query": {
                "bool": {
                    "must": [
                        {"match": {"document_id": document_id}},
                        {
                            "script_score": {
                                "query": {"match_all": {}},
                                "script": {
                                    "source": "Math.max(cosineSimilarity(params.query_vector, 'embeddings'), 0)",
                                    "params": {
                                        "query_vector": query_embedding
                                    }
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
        results = self.es.search(
            index=self.PARAGRAPHS_INDEX,
            body=p_query,
            size=max_results
        )
        hits = results["hits"]["hits"]

        # Convert the elastic search results to ParagraphResult objects
        return [self.format_paragraph_result(r) for r in hits]

    def query_titles(self, query: str, max_results: int = 10) -> list[MetadataResult]:
        """perform a search over all document titles in the database for the given query"""
        p_query = {
            "query": {
                "match": {
                    "title": query
                }
            }
        }
        results = self.es.search(
            index=self.DOCUMENTS_INDEX,
            body=p_query,
            size=max_results
        )
        hits = results["hits"]["hits"]

        # Convert the elastic search results to MetadataResult objects
        return [self.format_metadata_result(r) for r in hits]

    def query_authors(self, author: str, max_results: int = 10) -> list[MetadataResult]:
        """perform a search over all document authors in the database for the given query"""
        p_query = {
            "query": {
                "match": {
                    "author": author
                }
            }
        }
        results = self.es.search(
            index=self.DOCUMENTS_INDEX,
            body=p_query,
            size=max_results
        )
        hits = results["hits"]["hits"]

        # Convert the elastic search results to MetadataResult objects
        return [self.format_metadata_result(r) for r in hits]

    def query_publishers(self, publisher: str, max_results: int = 10) -> list[MetadataResult]:
        """perform a search over all document publishers in the database for the given query"""
        p_query = {
            "query": {
                "match": {
                    "publisher": publisher
                }
            }
        }
        results = self.es.search(
            index=self.DOCUMENTS_INDEX,
            body=p_query,
            size=max_results
        )
        hits = results["hits"]["hits"]

        # Convert the elastic search results to MetadataResult objects
        return [self.format_metadata_result(r) for r in hits]

    @staticmethod
    def format_paragraph_result(item) -> ParagraphResult:
        return ParagraphResult(
            score=item["_score"],
            document_id=item["_source"]["document_id"],
            paragraph_idx=item["_source"]["index"],
            paragraph=item["_source"]["text"]
        )

    @staticmethod
    def format_metadata_result(item) -> MetadataResult:
        return MetadataResult(
            document_id=item["_id"],
            title=item["_source"].get("title", ""),
            author=item["_source"].get("author", ""),
            publisher=item["_source"].get("publisher", ""),
            score=max(min(item["_score"], 1.0), 0.0)  # clamp score between 0 and 1
        )


router = APIRouter()


# REDIS CONNECTION AND QUEUE OBJECTS
redis = Redis(
    os.environ.get("REDIS_HOST", "redis.dojo-stack"),
    int(os.environ.get("REDIS_PORT", 6379)),
)
q = Queue(connection=redis, default_timeout=-1)


embedder = AdaEmbedder()
db = ElasticSearchDB(embedder)
agent = OpenAIAgent(model='gpt-4o')
causal_agent = CausalRecommender(agent)
librarian = MultihopRagAgent(db, agent)


def load_file_as_json(file_path: str) -> dict:
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data


def get_project_root() -> Path:
    return Path(__file__).parent.parent


MOCK_MESSAGE_PATH = path_join(get_project_root(), "mock-data", "message.json")


@router.get("/knowledge/message")
def message(query: str):
    results, answer = librarian.ask(query, stream=False)

    result_obj = {
        'candidate_paragraphs': [asdict(r) for r in results],
        'answer': answer,
    }

    return result_obj


@router.get("/knowledge/mock-message")
def mock_message(query: str):
    logger.info("Quick mock message endpoint called.")
    result_dict = load_file_as_json(MOCK_MESSAGE_PATH)
    return result_dict


@router.get("/knowledge/chat")
def chat(query: str):

    def data_streamer():
        results, answer_gen = librarian.ask(query, stream=True)
        metadata = {
            'candidate_paragraphs': [asdict(r) for r in results]
        }
        json_payload = json.dumps(metadata)
        yield ServerSentEvent(data=json_payload, event='stream-paragraphs')
        for answer_chunk in answer_gen:
            yield ServerSentEvent(data=answer_chunk, event='stream-answer')
        time.sleep(0.5)  # delay to ensure the client has enough time to process before ending the stream
        yield ServerSentEvent(data="Stream Complete", event='stream-complete')

    return EventSourceResponse(data_streamer(), media_type='text/event-stream')


@router.get("/knowledge/mock-chat")
def mock_chat(query: Optional[str]):
    result_dict = load_file_as_json(MOCK_MESSAGE_PATH)
    answer = result_dict["answer"]
    metadata = {'candidate_paragraphs': result_dict["candidate_paragraphs"]}

    def data_streamer():
        json_payload = json.dumps(metadata)
        yield ServerSentEvent(data=json_payload, event='stream-paragraphs')
        time.sleep(1)

        for token in answer.split():
            yield ServerSentEvent(data=" " + token, event='stream-answer')
            time.sleep(0.05)
        time.sleep(0.5)  # delay to ensure the client has enough time to process before ending the stream
        yield ServerSentEvent(data="Stream Complete", event='stream-complete')

    return EventSourceResponse(data_streamer(), media_type='text/event-stream')


class RequestBody(BaseModel):
    topic: str
    location: Optional[str] = None


def format_documents(results: list[ParagraphResult]):
    return [
        {
            "text": r.paragraph,
            "document_id": r.document_id,
            "paragraph_id": f"{r.document_id}-{r.paragraph_idx}",
        } for r in results
    ]


def format_links(data, variant: Literal["causes", "effects"]):
    """
    Receives causes or effects data from our GPT CausalRecommender and
    formats to a backwards-compatible format with existing API endpoints.
    """
    (link_citations, is_grounded) = data
    out = {
        "grounded": is_grounded,
        variant: [],
        "citations": []
    }
    for (topic, references) in link_citations:
        out[variant].append(topic)
        if is_grounded:
            out["citations"].append({
                "name": topic,
                "indexes": references
            })

    return out


def causal_helper(payload: RequestBody, variant: Literal["causes", "effects"]):
    topic = payload.topic

    if payload.location:
        topic = f"{topic} in {payload.location}"

    logger.info(f"Calculating {variant} for topic: {topic}")

    results = db.query_all_documents(topic)

    paragraphs = [r.paragraph for r in results]

    fn = causal_agent.get_causes if variant == "causes" else causal_agent.get_effects

    try:
        result = format_links(fn(topic, paragraphs), variant)
        result["documents"] = format_documents(results)
        return result
    except ValueError:
        logger.error("Failed with ValueError while parsing LLM response.")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.post("/causal-recommender/causes", response_model=CausesResponse)
def causes(payload: RequestBody):
    return causal_helper(payload, "causes")


@router.post("/causal-recommender/effects", response_model=EffectsResponse)
def effects(payload: RequestBody):
    return causal_helper(payload, "effects")


@router.post("/causal-recommender/", response_model=RecommenderFullResponse)
def causes_and_effects(payload: RequestBody):
    topic = payload.topic

    if payload.location:
        topic = f"{topic} in {payload.location}"

    logger.info(f"Calculating causes,effects for topic: {topic}")

    results = db.query_all_documents(topic)
    paragraphs = [r.paragraph for r in results]

    causes_error = None
    effects_error = None

    try:
        causes = causal_agent.get_causes(topic, paragraphs)
        causes_data = format_links(causes, variant="causes")
    except ValueError:
        causes_error = "Failed with ValueError while parsing LLM response."

    try:
        effects = causal_agent.get_effects(topic, paragraphs)
        effects_data = format_links(effects, variant="effects")
    except ValueError:
        effects_error = "Failed with ValueError while parsing LLM response."

    return {
        "causes": causes_data["causes"],
        "effects": effects_data["effects"],
        "metadata": {
            "causes": {
                "grounded":  causes_data["grounded"],
                "citations": causes_data["citations"],
                "errors": causes_error
            },
            "effects": {
                "grounded":  effects_data["grounded"],
                "citations": effects_data["citations"],
                "errors": effects_error
            }
        },
        "documents": format_documents(results)
    }
