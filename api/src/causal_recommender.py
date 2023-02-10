from __future__ import annotations

import io
import re
import time
import uuid
from datetime import datetime
# from typing import Any, Dict, Generator, List, Optional
from urllib.parse import urlparse

import json

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
# from fastapi.responses import StreamingResponse

# from validation import IndicatorSchema, DojoSchema, MetadataSchema
# from src.settings import settings

# from src.utils import put_rawfile, get_rawfile, list_files

from src.causal_recommender_engine import recommender_engine


import os

router = APIRouter()


@router.post("/causal-recommender/causes")
def get_causality_recommendation_causes(topic: str):

    logger.info("Calculating causes for topic")

    return {"causes": recommender_engine.get_causes(topic)}


@router.post("/causal-recommender/effects")
def get_causality_recommendation_effects(topic: str):

    return Response(
        status_code=status.HTTP_200_OK,
        headers={
            "content-type": "application/json",
        },
        content={"effects": recommender_engine.get_effects(topic)},
    )


@router.post("/causal-recommender")
def get_causality_recommendation_both(topic: str):

    return {
        "causes": recommender_engine.get_causes(topic),
        "effects": recommender_engine.get_effects(topic)
    }

    # return Response(
    #     status_code=status.HTTP_200_OK,
    #     headers={
    #         "content-type": "application/json",
    #     },
    #     content={},
    # )
