import requests
import json
from urllib.parse import quote_plus
from fastapi import APIRouter, Response
from fastapi.logger import logger 

from src.settings import settings

router = APIRouter()

@router.get("/dkg/search/{term}")
def search_ontologies(term: str):
    """
    Wraps search functionality from the DKG.
    """
    headers = {"accept": "application/json", "Content-Type": "application/json"}
    base_url = settings.DKG_URL
    params = f"search?q={term}&limit=25"
    url = f"{base_url}/{params}"
    logger.info(f"Sending data to {url}")

    try:
        response = requests.get(url, headers=headers)
        logger.debug(f"response: {response}")
        logger.debug(f"response reason: {response.raw.reason}")

        if response.status_code == 200:
            return json.loads(
              response.content.decode("utf8")
            )
        else:
            logger.debug(f"Failed to fetch ontologies: {response}")
            raise Exception(f"DKG server return the status {response.status_code}")
    except Exception as e:
        logger.error(f"Encountered problems communicating with the DKG service: {e}")
        logger.exception(e)
        return {}

@router.get("/dkg/get/{ontology_id}")
def get_ontologies(ontology_id: str):
    """
    Wraps fetch functionality from the DKG.
    """
    headers = {"accept": "application/json", "Content-Type": "application/json"}
    base_url = settings.DKG_URL
    params = f"entity/{quote_plus(ontology_id)}"
    url = f"{base_url}/{params}"
    logger.info(f"Sending data to {url}")

    try:
        response = requests.get(url, headers=headers)
        logger.debug(f"response: {response}")
        logger.debug(f"response reason: {response.raw.reason}")

        if response.status_code == 200:
            return json.loads(
              response.content.decode("utf8")
            )
        else:
            logger.debug(f"Failed to fetch ontologies: {response}")
            raise Exception(f"DKG server return the status {response.status_code}")
    except Exception as e:
        logger.error(f"Encountered problems communicating with the DKG service: {e}")
        logger.exception(e)
        return {}

