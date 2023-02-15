from __future__ import annotations

import uvicorn
from pydantic import BaseModel

from fastapi import (
    FastAPI
    # Response,
    # status
)
from fastapi.logger import logger
from typing import List

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


uvicorn.run(
    app,
    host="0.0.0.0",
    port=8084
)
