from __future__ import annotations

import uvicorn
from pydantic import BaseModel

from fastapi import (
    APIRouter,
    FastAPI,
    Response,
    status
)
from fastapi.logger import logger
from typing import Any, Dict, Generator, List, Optional

from causal_recommender_model import recommender_engine


app = FastAPI()


class RequestBody(BaseModel):
    topic: str


class CausesResponseSchema(BaseModel):
    causes: List[str]


class EffectsResponseSchema(BaseModel):
    effects: List[str]


class AllResponseSchema(BaseModel):
    causes: List[str]
    effects: List[str]


# @app.get("/")
# async def root():
#     return {"message": "Hello World"}


@app.post("/causal-recommender/causes", response_model=CausesResponseSchema)
def get_causality_recommendation_causes(payload: RequestBody):
    logger.info("Calculating causes for topic")

    causes = recommender_engine.get_causes(payload.topic)

    return {"causes": causes}


@app.post("/causal-recommender/effects", response_model=EffectsResponseSchema)
def get_causality_recommendation_effects(payload: RequestBody):

    logger.info("Calculating effects for topic")

    effects = recommender_engine.get_effects(payload.topic)

    return {"effects": effects}


@app.post("/causal-recommender", response_model=AllResponseSchema)
def get_causality_recommendation_both(payload: RequestBody):

    return {
        "causes": recommender_engine.get_causes(payload.topic),
        "effects": recommender_engine.get_effects(payload.topic)
    }



def print_debug_routes() -> None:
    print("hello print debug routes")
    max_len = max(len(route.path) for route in app.routes)
    routes = sorted(
        [
            (method, route.path, route.name)
            for route in app.routes
            for method in route.methods
        ],
        key=lambda x: (x[1], x[0]),
    )
    route_table = "\n".join(
        f"{method:7} {path:{max_len}} {name}" for method, path, name in routes
    )
    logger.info(f"Route Table:\n{route_table}")


@app.on_event("startup")
async def startup_event():
    print_debug_routes()


uvicorn.run(
    app,
    host="0.0.0.0",
    port=8084
)
