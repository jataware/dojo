
from __future__ import annotations

import time
from typing import Optional
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

from dataclasses import dataclass
from fastapi.logger import logger
import os
import json

# from validation import DocumentSchema
from src.settings import settings

from rq import Queue
from redis import Redis
from src.embedder_engine import embedder

from sse_starlette.sse import EventSourceResponse
from src.openai_gpt import GPT4Synthesizer, GPT4CausalRecommender
from pydantic import BaseModel
from pathlib import Path
from os.path import join as path_join
from validation.KnowledgeSchema import (
    CausesResponse,
    EffectsResponse,
    RecommenderFullResponse
)


PARAGRAPHS_INDEX = "paragraphs"

router = APIRouter()

es = Elasticsearch([settings.ELASTICSEARCH_URL], port=settings.ELASTICSEARCH_PORT)

# REDIS CONNECTION AND QUEUE OBJECTS
redis = Redis(
    os.environ.get("REDIS_HOST", "redis.dojo-stack"),
    int(os.environ.get("REDIS_PORT", 6379)),
)
q = Queue(connection=redis, default_timeout=-1)


@dataclass
class Result:
    score: float
    document_id: str
    paragraph_idx: int
    paragraph: str

    def to_dict(self) -> dict:
        return {
            'score': self.score,
            'document_id': self.document_id,
            'paragraph_idx': self.paragraph_idx,
            'paragraph': self.paragraph
        }


def format_result(item):
    return Result(
        score=item["_score"],
        document_id=item["_source"]["document_id"],
        paragraph_idx=item["_source"]["index"],
        paragraph=item["_source"]["text"]
    )


def query_elasticsearch(query_embedding, max_results):
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

    results = es.search(
        index=PARAGRAPHS_INDEX,
        body=p_query,
        size=max_results
    )
    hits = results["hits"]["hits"]

    return [format_result(r) for r in hits]


class ElasticSearchDB():
    def __init__(self, embedder):
        # self.extractor = extractor
        self.embedder = embedder

    def query(self, query: str, max_results: int = 10) -> list[Result]:
        # embed the query
        embedding = embedder.embed([query])[0]

        # elasticsearch cosine similarity over all online documents
        results = query_elasticsearch(embedding, max_results)

        # They're all formatted and instances of Result
        return results


class Librarian:
    def __init__(self, db, agent):
        self.db = db
        self.agent = agent

    def ask(self, query: str, stream: bool = False, max_results: int = 10):
        # semantic search over the database
        start = time.time()
        results = self.db.query(query, max_results=max_results)
        end = time.time()

        logger.info(f"Search step took: {end - start} seconds.")
        logger.debug(f"First result: {results[0]}")

        start = time.time()
        # synthesizer answer from the semantic search results
        answer = self.agent.ask(
            query,
            [r.paragraph for r in results],
            stream=stream
        )
        end = time.time()

        logger.info(f"GPT Answer step took: {end - start} seconds.")

        return results, answer


db = ElasticSearchDB(embedder)
agent = GPT4Synthesizer('gpt-4-1106-preview')
causal_agent = GPT4CausalRecommender('gpt-4-1106-preview')
librarian = Librarian(db, agent)


def load_file_as_json(file_path: str) -> dict:
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data


def get_project_root() -> Path:
    return Path(__file__).parent.parent


MOCK_MESSAGE_PATH = path_join(get_project_root(), "mock-data", "message.json")


@router.get("/knowledge/chat")
def chat(query: str):

    def data_streamer():
        results, answer_gen = librarian.ask(query, stream=True)
        metadata = {
            'candidate_paragraphs': [r.to_dict() for r in results]
        }
        json_payload = json.dumps(metadata)
        yield f'event: custom-event\ndata: {json_payload}\n\n'
        yield from answer_gen

    return EventSourceResponse(data_streamer(), media_type='text/event-stream')


@router.get("/knowledge/message")
def message(query: str):
    results, answer = librarian.ask(query, stream=False)

    result_obj = {
        'candidate_paragraphs': [r.to_dict() for r in results],
        'answer': answer,
    }

    return result_obj


@router.get("/knowledge/mock-message")
def mock_message(query: str):
    logger.info("Quick mock message endpoint called.")
    result_dict = load_file_as_json(MOCK_MESSAGE_PATH)
    return result_dict


@router.get("/knowledge/mock-chat")
def mock_chat(query: Optional[str]):
    result_dict = load_file_as_json(MOCK_MESSAGE_PATH)
    answer = result_dict["answer"]
    metadata = result_dict["candidate_paragraphs"]

    def data_streamer():
        json_payload = json.dumps(metadata)
        yield f'event: custom-event\ndata: {json_payload}\n\n'
        time.sleep(1)

        for token in answer.split():
            yield token
            time.sleep(0.3)

    return EventSourceResponse(data_streamer(), media_type='text/event-stream')


class RequestBody(BaseModel):
    topic: str
    location: Optional[str] = None


def format_documents(results: list[Result]):
    return [
        {
            "text": r.paragraph,
            "document_id": r.document_id,
            "paragraph_id": f"{r.document_id}-{r.paragraph_idx}",
        } for r in results
    ]


def format_links(data, variant):
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


def causal_helper(payload, variant):
    topic = payload.topic

    if payload.location:
        topic = f"{topic} in {payload.location}"

    logger.info(f"Calculating {variant} for topic: {topic}")

    results = db.query(topic)

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

    results = db.query(topic)
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
