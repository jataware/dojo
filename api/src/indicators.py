from __future__ import annotations

import csv
import io
import re
import time
import zlib
import uuid
from datetime import datetime
from typing import Any, Dict, Generator, List, Optional
from urllib.parse import urlparse

import json
import pandas as pd

from elasticsearch import Elasticsearch
import pandas as pd
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
from src.ontologies import get_ontologies
from src.causemos import notify_causemos
from src.causemos import deprecate_dataset
from src.utils import put_rawfile, get_rawfile, list_files
from src.plugins import plugin_action
from validation.IndicatorSchema import (
    IndicatorMetadataSchema,
    QualifierOutput,
    Output,
    Period,
    Geography,
    FeaturesSearchSchema
)
from functools import reduce
import os

from rq import Queue
from redis import Redis
from rq.exceptions import NoSuchJobError
from rq import job

from src.datasearch.corpora import Corpus
from src.search.bert_search import BertSentenceSearch

router = APIRouter()

es = Elasticsearch([settings.ELASTICSEARCH_URL], port=settings.ELASTICSEARCH_PORT)

# REDIS CONNECTION AND QUEUE OBJECTS
redis = Redis(
    os.environ.get("REDIS_HOST", "redis.dojo-stack"),
    os.environ.get("REDIS_PORT", "6379"),
)
q = Queue(connection=redis, default_timeout=-1)

# For created_at times in epoch milliseconds
def current_milli_time():
    return round(time.time() * 1000)

# Initialize LLM Semantic Search Engine. Requires a corpus on instantiation
# for now. We'll refactor the embedder engine once out of PoC stage.
corpus = Corpus.from_list(["a"])
engine = BertSentenceSearch(corpus, cuda=False)


def enqueue_indicator_feature(indicator_id, indicator_dict):
    """
    Adds indiciator to queue to process by embeddings_process, which
    at this time creates and attaches LLM embeddings to its features (outputs)
    """
    job_string = "embeddings_processors.calculate_store_embeddings"
    job_id = f"{indicator_id}_{job_string}"

    context = {
        "indicator_id": indicator_id,
        "full_indicator": indicator_dict
    }

    job = q.enqueue_call(
        func=job_string, args=[context], kwargs={}, job_id=job_id
    )


@router.post("/indicators")
def create_indicator(payload: IndicatorSchema.IndicatorMetadataSchema):
    indicator_id = str(uuid.uuid4())
    payload.id = indicator_id
    payload.created_at = current_milli_time()
    body = payload.json()
    payload.published = False

    plugin_action("before_create", data=body, type="indicator")
    es.index(index="indicators", body=body, id=indicator_id)
    plugin_action("post_create", data=body, type="indicator")

    empty_annotations_payload = MetadataSchema.MetaModel(metadata={}).json()
    # (?): SHOULD WE HAVE PLUGINS AROUND THE ANNOTATION CREATION?
    plugin_action("before_create", data=body, type="annotation")
    es.index(index="annotations", body=empty_annotations_payload, id=indicator_id)
    plugin_action("post_create", data=body, type="annotation")

    # Saves all outputs, as features in a new index, with LLM embeddings
    if payload.outputs:
        enqueue_indicator_feature(indicator_id, json.loads(payload.json()))

    return Response(
        status_code=status.HTTP_201_CREATED,
        headers={
            "location": f"/api/indicators/{indicator_id}",
            "content-type": "application/json",
        },
        content=body,
    )


@router.put("/indicators")
def update_indicator(payload: IndicatorSchema.IndicatorMetadataSchema):
    indicator_id = payload.id
    payload.created_at = current_milli_time()
    body = payload.json()

    plugin_action("before_update", data=body, type="indicator")
    es.index(index="indicators", body=body, id=indicator_id)
    plugin_action("post_update", data=body, type="indicator")

    if payload.outputs:
        enqueue_indicator_feature(indicator_id, json.loads(payload.json()))

    return Response(
        status_code=status.HTTP_200_OK,
        headers={"location": f"/api/indicators/{indicator_id}"},
        content=f"Updated indicator with id = {indicator_id}",
    )


@router.patch("/indicators")
def patch_indicator(
    payload: IndicatorSchema.IndicatorMetadataSchema, indicator_id: str
):
    payload.created_at = current_milli_time()
    body = json.loads(payload.json(exclude_unset=True))
    es.update(index="indicators", body={"doc": body}, id=indicator_id)

    if payload.outputs:
        enqueue_indicator_feature(indicator_id, json.loads(payload.json()))

    return Response(
        status_code=status.HTTP_200_OK,
        headers={"location": f"/api/indicators/{indicator_id}"},
        content=f"Updated indicator with id = {indicator_id}",
    )

# TODO if we reuse the search schema response model, we need to allow extra for
# semantic search max_score and other properties
@router.get(
"/features/search" # , response_model=IndicatorSchema.FeaturesSearchSchema
)
def semantic_search_features(query: str, scroll_id: Optional[str]=None):
    """
    Given a text query, uses semantic search engine to search for features that
    match the query semantically. Query is a sentence that can be interpreted to
    be related to a concept, such as:
    'number of people who have been vaccinated'
    """

    size = 200

    query_embedding = engine.embed_query(query)

    features_query = {
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

    results = es.search(index="features", body=features_query, scroll="2m", size=size)

    if len(results["hits"]["hits"]) < size:
        scroll_id = None
    else:
        scroll_id = results.get("_scroll_id", None)

    max_score = results["hits"]["max_score"]

    def formatOneResult(r):
        r["_source"]["_score"] = r["_score"]
        return r["_source"]

    return {
        "hits": results["hits"]["total"]["value"],
        "items_in_page": len(results["hits"]["hits"]),
        "scroll_id": scroll_id,
        "max_score": max_score,
        "results": [formatOneResult(i) for i in results["hits"]["hits"]],
    }


def outputs_as_features(acc, currentResult):
    """Used to reduce the complete `indicators.outputs` properties and
    format as features for client"""
    datasetInfo = currentResult["_source"]
    c = map(lambda output: {"owner_dataset": datasetInfo, **output["_source"]},
            currentResult["inner_hits"]["outputs"]["hits"]["hits"])
    result = acc + list(c)

    return result


@router.get(
    "/features", response_model=IndicatorSchema.FeaturesSearchSchema
)
def search_features(term: Optional[str]=None, scroll_id: Optional[str]=None):
    """
    Return all features, or results from searching through them, if a search
    term is provided. Will match `term` with wildcard to feature `name`,
    `display_name`, or `description`.
    """
    if term:
        wildcardTerm = f"*{term}*"

        q = {
            "query": {
                "nested": {
                    "path": "outputs",
                    "query": {
                        "bool": {
                            "should": [
                                { "wildcard": { "outputs.name": wildcardTerm }},
                                { "wildcard": { "outputs.display_name": wildcardTerm }},
                                { "wildcard": { "outputs.description": wildcardTerm }}
                            ]
                        }
                    },
                    "inner_hits": {
                    }
                }
            },
            "_source": [
                "id",
                "name"
            ]
        }
    else:
        q = {
            "query": {
                "nested": {
                    "path": "outputs",
                    "query": {
                        "match_all": {}
                    },
                    "inner_hits": {}
                }
            },
            "_source": [
                "id",
                "name"
            ]
        }

    if not scroll_id:
        # we need to kick off the query
        results = es.search(index="indicators", body=q, scroll="2m", size=10)
    else:
        # otherwise, we can use the scroll
        results = es.scroll(scroll_id=scroll_id, scroll="2m")

    # These are document hits (es parent indicators) in current page
    # The final response items_in_page property will group features within
    # these indicators (will be more than indicator count)
    totalIndicatorHitsInPage = len(results["hits"]["hits"])

    # if results are less than the page size (10) don't return a scroll_id
    if totalIndicatorHitsInPage < 10:
        scroll_id = None
    else:
        scroll_id = results.get("_scroll_id", None)

    # Groups features as array list from `results`, into `response`
    response = reduce(outputs_as_features, results["hits"]["hits"], [])

    return {
        "items_in_page": len(response),
        "scroll_id": scroll_id,
        "results": response # array of features
    }

@router.get(
    "/indicators/latest", response_model=List[IndicatorSchema.IndicatorsSearchSchema]
)
def get_latest_indicators(size=10000):
    q = {
        "_source": [
            "description",
            "name",
            "id",
            "created_at",
            "deprecated",
            "maintainer.name",
            "maintainer.email",
        ],
        "query": {
            "bool": {
                "must": [{"match_all": {}}],
                "filter": [{"term": {"published": True}}],
            }
        },
    }
    results = es.search(index="indicators", body=q, size=size)["hits"]["hits"]
    IndicatorsSchemaArray = []
    for res in results:
        IndicatorsSchemaArray.append(res.get("_source"))
    return IndicatorsSchemaArray


@router.get("/indicators", response_model=DojoSchema.IndicatorSearchResult)
def search_indicators(
    query: str = Query(None),
    size: int = 10,
    scroll_id: str = Query(None),
    include_ontologies: bool = True,
    include_geo: bool = True,
) -> DojoSchema.IndicatorSearchResult:
    indicator_data = search_and_scroll(
        index="indicators", size=size, query=query, scroll_id=scroll_id
    )
    # if request wants ontologies and geo data return all
    if include_ontologies and include_geo:
        return indicator_data
    else:
        for indicator in indicator_data["results"]:
            if not include_ontologies:
                for q_output in indicator["qualifier_outputs"]:
                    try:
                        q_output["ontologies"] = {
                            "concepts": None,
                            "processes": None,
                            "properties": None,
                        }
                    except Exception as e:
                        print(e)
                        logger.exception(e)
                for outputs in indicator["outputs"]:
                    try:
                        outputs["ontologies"] = {
                            "concepts": None,
                            "processes": None,
                            "properties": None,
                        }
                    except Exception as e:
                        print(e)
                        logger.exception(e)
            if not include_geo:
                indicator["geography"]["country"] = []
                indicator["geography"]["admin1"] = []
                indicator["geography"]["admin2"] = []
                indicator["geography"]["admin3"] = []

        return indicator_data


@router.get(
    "/indicators/{indicator_id}", response_model=IndicatorSchema.IndicatorMetadataSchema
)
def get_indicators(indicator_id: str) -> IndicatorSchema.IndicatorMetadataSchema:
    try:
        indicator = es.get(index="indicators", id=indicator_id)["_source"]
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return indicator


@router.put("/indicators/{indicator_id}/publish")
def publish_indicator(indicator_id: str):
    try:
        # Update indicator model with ontologies from UAZ
        indicator = es.get(index="indicators", id=indicator_id)["_source"]
        indicator["published"] = True
        data = get_ontologies(indicator, type="indicator")
        logger.info(f"Sent indicator to UAZ")
        es.index(index="indicators", body=data, id=indicator_id)

        # Notify Causemos that an indicator was created
        plugin_action("before_register", data=indicator, type="indicator")
        # TODO: Move notify_causemose only to causemos plugin
        notify_causemos(data, type="indicator")
        plugin_action("register", data=indicator, type="indicator")
        plugin_action("post_register", data=indicator, type="indicator")
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return Response(
        status_code=status.HTTP_200_OK,
        headers={"location": f"/api/indicators/{indicator_id}/publish"},
        content=f"Published indicator with id {indicator_id}",
    )


@router.put("/indicators/{indicator_id}/deprecate")
def deprecate_indicator(indicator_id: str):
    try:
        indicator = es.get(index="indicators", id=indicator_id)["_source"]
        indicator["deprecated"] = True
        es.index(index="indicators", id=indicator_id, body=indicator)

        # Tell Causemos to deprecate the dataset on their end
        deprecate_dataset(indicator_id)
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return Response(
        status_code=status.HTTP_200_OK,
        headers={"location": f"/api/indicators/{indicator_id}"},
        content=f"Deprecated indicator with id {indicator_id}",
    )


@router.get(
    "/indicators/{indicator_id}/annotations", response_model=MetadataSchema.MetaModel
)
def get_annotations(indicator_id: str) -> MetadataSchema.MetaModel:
    """Get annotations for a dataset.

    Args:
        indicator_id (str): The UUID of the dataset to retrieve annotations for from elasticsearch.

    Raises:
        HTTPException: This is raised if no annotation is found for the dataset in elasticsearch.

    Returns:
        MetadataSchema.MetaModel: Returns the annotations pydantic schema for the dataset that contains a metadata dictionary and an annotations object validated via a nested pydantic schema.
    """
    try:
        annotation = es.get(index="annotations", id=indicator_id)["_source"]
        return annotation
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        return None


@router.post("/indicators/{indicator_id}/annotations")
def post_annotation(payload: MetadataSchema.MetaModel, indicator_id: str):
    """Post annotations for a dataset.

    Args:
        payload (MetadataSchema.MetaModel): Payload needs to be a fully formed json object representing the pydantic schema MettaDataSchema.MetaModel.
        indicator_id (str): The UUID of the dataset to retrieve annotations for from elasticsearch.

    Returns:
        Response: Returns a response with the status code of 201 and the location of the annotation.
    """
    try:

        body = json.loads(payload.json())

        es.index(index="annotations", body=body, id=indicator_id)

        return Response(
            status_code=status.HTTP_201_CREATED,
            headers={"location": f"/api/annotations/{indicator_id}"},
            content=f"Updated annotation with id = {indicator_id}",
        )
    except Exception as e:
        logger.exception(e)
        return Response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=f"Could not update annotation with id = {indicator_id}",
        )


@router.put("/indicators/{indicator_id}/annotations")
def put_annotation(payload: MetadataSchema.MetaModel, indicator_id: str):
    """Put annotation for a dataset to Elasticsearch.

    Args:
        payload (MetadataSchema.MetaModel): Payload needs to be a fully formed json object representing the pydantic schema MettaDataSchema.MetaModel.
        indicator_id (str): The UUID of the dataset for which the annotations apply.

    Returns:
        Response: Response object with status code, informational messages, and content.
    """
    try:

        body = json.loads(payload.json())

        es.index(index="annotations", body=body, id=indicator_id)

        return Response(
            status_code=status.HTTP_201_CREATED,
            headers={"location": f"/api/annotations/{indicator_id}"},
            content=f"Created annotation with id = {indicator_id}",
        )
    except Exception as e:
        logger.exception(e)

        return Response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=f"Could not create annotation with id = {indicator_id}",
        )

@router.patch("/indicators/{indicator_id}/annotations")
def patch_annotation(payload: MetadataSchema.MetaModel, indicator_id: str):
    """Patch annotation for a dataset to Elasticsearch.

    Args:
        payload (MetadataSchema.MetaModel): Payload needs to be a partially formed json object valid for the pydantic schema MettaDataSchema.MetaModel.
        indicator_id (str): The UUID of the dataset for which the annotations apply.

    Returns:
        Response: Response object with status code, informational messages, and content.
    """
    try:

        body = json.loads(payload.json(exclude_unset=True))

        es.update(index="annotations", body={"doc": body}, id=indicator_id)

        return Response(
            status_code=status.HTTP_201_CREATED,
            headers={"location": f"/api/annotations/{indicator_id}"},
            content=f"Updated annotation with id = {indicator_id}",
        )
    except Exception as e:
        logger.exception(e)
        return Response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=f"Could not update annotation with id = {indicator_id}",
        )



@router.post("/indicators/{indicator_id}/upload")
def upload_file(
    indicator_id: str,
    file: UploadFile = File(...),
    filename: Optional[str] = None,
    append: Optional[bool] = False,
):
    original_filename = file.filename
    _, ext = os.path.splitext(original_filename)
    dir_path = os.path.join(settings.DATASET_STORAGE_BASE_URL, indicator_id)
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
    dest_path = os.path.join(settings.DATASET_STORAGE_BASE_URL, indicator_id, filename)
    put_rawfile(path=dest_path, fileobj=file.file)

    return Response(
        status_code=status.HTTP_201_CREATED,
        headers={
            "location": f"/api/indicators/{indicator_id}",
            "content-type": "application/json",
        },
        content=json.dumps({"id": indicator_id, "filename": filename}),
    )


@router.get("/indicators/{indicator_id}/verbose")
def get_all_indicator_info(indicator_id: str):
    indicator = get_indicators(indicator_id)
    annotations = get_annotations(indicator_id)

    verbose_return_object = {"indicators": indicator, "annotations": annotations}

    return verbose_return_object


@router.post(
    "/indicators/validate_date",
    response_model=IndicatorSchema.DateValidationResponseSchema,
)
def validate_date(payload: IndicatorSchema.DateValidationRequestSchema):
    valid = True
    try:
        for value in payload.values:
            datetime.strptime(value, payload.format)
    except ValueError as e:
        logger.exception(e)
        valid = False

    return {
        "format": payload.format,
        "valid": valid,
    }


@router.post("/indicators/{indicator_id}/preview/{preview_type}")
async def create_preview(
    indicator_id: str, preview_type: IndicatorSchema.PreviewType, filename: Optional[str] = Query(None),
    filepath: Optional[str] = Query(None),
):
    """Get preview for a dataset.

    Args:
        indicator_id (str): The UUID of the dataset to return a preview of.

    Returns:
        JSON: Returns a json object containing the preview for the dataset.
    """
    try:
        if filename:
            file_suffix_match = re.search(r'raw_data(_\d+)?\.', filename)
            if file_suffix_match:
                file_suffix = file_suffix_match.group(1) or ''
            else:
                file_suffix = ''
        else:
            file_suffix = ''
        # TODO - Get all potential string files concatenated together using list file utility
        if preview_type == IndicatorSchema.PreviewType.processed:
            if filepath:
                rawfile_path = os.path.join(
                    settings.DATASET_STORAGE_BASE_URL,
                    filepath.replace(".csv", ".parquet.gzip")
                )
            else:
                rawfile_path = os.path.join(
                    settings.DATASET_STORAGE_BASE_URL,
                    indicator_id,
                    f"{indicator_id}{file_suffix}.parquet.gzip",
                )

            file = get_rawfile(rawfile_path)
            df = pd.read_parquet(file)
            try:
                strparquet_path = os.path.join(
                    settings.DATASET_STORAGE_BASE_URL,
                    indicator_id,
                    f"{indicator_id}_str{file_suffix}.parquet.gzip",
                )
                file = get_rawfile(strparquet_path)
                df_str = pd.read_parquet(file)
                df = pd.concat([df, df_str])
            except FileNotFoundError:
                pass

        else:
            if filepath:
                rawfile_path = os.path.join(
                    settings.DATASET_STORAGE_BASE_URL, filepath
                )
            else:
                rawfile_path = os.path.join(
                    settings.DATASET_STORAGE_BASE_URL, indicator_id, "raw_data.csv"
                )
            file = get_rawfile(rawfile_path)
            df = pd.read_csv(file, delimiter=",")

        obj = json.loads(df.sort_index().reset_index(drop=True).head(100).to_json(orient="index"))
        indexed_rows = [{"__id": key, **value} for key, value in obj.items()]

        return indexed_rows
    except FileNotFoundError as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        logger.exception(e)
        return Response(
            status_code=status.HTTP_400_BAD_REQUEST,
            headers={"msg": f"Error: {e}"},
            content=f"Queue could not be deleted.",
        )
