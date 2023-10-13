import time
import uuid

from fastapi import APIRouter, HTTPException, status, Response
from fastapi.logger import logger
from fastapi.responses import JSONResponse
from elasticsearch import Elasticsearch, exceptions
from src.settings import settings
from validation.DataModelingSchema import DataModeling

router = APIRouter()
es = Elasticsearch([settings.ELASTICSEARCH_URL], port=settings.ELASTICSEARCH_PORT)

# For created_at times in epoch milliseconds
def current_milli_time():
    return round(time.time() * 1000)

@router.post("/data-modeling")
def create_data_modeling(payload: DataModeling):
    data_modeling_id = str(uuid.uuid4())
    payload.id = data_modeling_id
    payload.created_at = current_milli_time()

    body = payload.json()

    es.index(index="data_modelings", body=body, id=data_modeling_id)
    try:
        es.index(index="data_modelings", body=body, id=data_modeling_id)
    except Exception as e:
        if isinstance(e, exceptions.ConnectionError):
            detail = "Cannot connect to Elasticsearch."
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE
            logger.error(f"ConnectionError: {detail}")
        elif isinstance(e, exceptions.RequestError):
            detail = f"Elasticsearch request error: {str(e)}"
            status_code = status.HTTP_400_BAD_REQUEST
            logger.error(f"RequestError: {detail}")
        else:
            detail = "An unexpected error occurred."
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            # Log generic errors with the full exception trace
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)

        raise HTTPException(
            status_code=status_code,
            detail=detail
        )

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={"detail": "Success"},
        headers={"location": f"/api/data_modeling/{data_modeling_id}"},
    )
