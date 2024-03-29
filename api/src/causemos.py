import os

import requests
from fastapi.logger import logger
from src.plugins.causemos import convert_to_causemos_format


def deprecate_dataset(dataset_id):
    """
    A function to deprecate a dataset within Causemos

    PUT https://causemos.uncharted.software/api/maas/datacubes/exampleID/deprecate

    """
    url = f'{os.getenv("CAUSEMOS_IND_URL")}/datacubes/{dataset_id}/deprecate'
    causemos_user = os.getenv("CAUSEMOS_USER")
    causemos_pwd = os.getenv("CAUSEMOS_PWD")

    try:
        # Notify Uncharted
        if os.getenv("CAUSEMOS_DEBUG") == "true":
            logger.info("CauseMos debug mode: no need to notify Uncharted")
            return
        else:
            logger.info(f"Notifying Causemos to deprecate dataset")
            response = requests.put(
                url,
                auth=(causemos_user, causemos_pwd),
            )
            logger.info(f"Response from Uncharted: {response.text}")
            return

    except Exception as e:
        logger.error(f"Encountered problems communicating with Causemos: {e}")
        logger.exception(e)


def notify_causemos(data, type="indicator"):
    """
    A function to notify Causemos that a new indicator or model has been
    created.

    If type is "indicator":
        POST https://causemos.uncharted.software/api/maas/indicators/post-process
        // Request body: indicator metadata

    If type is "model":
        POST https://causemos.uncharted.software/api/maas/datacubes
        // Request body: model metadata
    """
    headers = {"accept": "application/json", "Content-Type": "application/json"}

    if type == "indicator":
        endpoint = "indicators/post-process"
    elif type == "model":
        endpoint = "datacubes"
        data = convert_to_causemos_format(data)

    # Notify Causemos that a model was created
    logger.info("Notifying CauseMos of model registration")

    url = f'{os.getenv("CAUSEMOS_IND_URL")}/{endpoint}'
    causemos_user = os.getenv("CAUSEMOS_USER")
    causemos_pwd = os.getenv("CAUSEMOS_PWD")

    try:
        # Notify Uncharted
        if os.getenv("CAUSEMOS_DEBUG") == "true":
            logger.info("CauseMos debug mode: no need to notify Uncharted")
            return
        else:
            logger.info(f"Notifying CauseMos of {type} creation...")
            response = requests.post(
                url,
                headers={"Content-Type": "application/json"},
                json=data,
                auth=(causemos_user, causemos_pwd),
            )
            logger.info(f"Response from Uncharted: {response.text}")
            return

    except Exception as e:
        logger.error(f"Encountered problems communicating with Causemos: {e}")
        logger.exception(e)


def submit_run(model):
    """
    This function takes in a model and submits a default run for that model to CauseMos

    POST https://causemos.uncharted.software/api/maas/model-runs
    // The request body must at a minimum include
    {
    model_id,
    model_name,
    parameters,
    is_default_run = true
    }
    """

    logger.info("Submitting default run to CauseMos")

    headers = {"accept": "application/json", "Content-Type": "application/json"}
    endpoint = "model-runs"
    url = f'{os.getenv("CAUSEMOS_IND_URL")}/{endpoint}'
    causemos_user = os.getenv("CAUSEMOS_USER")
    causemos_pwd = os.getenv("CAUSEMOS_PWD")

    payload = {
        "model_id": model["id"],
        "model_name": model["name"],
        "is_default_run": True,
        "parameters": [],
    }

    try:
        # Notify Uncharted
        if os.getenv("CAUSEMOS_DEBUG") == "true":
            logger.info(
                "CauseMos debug mode: no need to submit default model run to Uncharted"
            )
            return
        else:
            logger.info(
                f"Submitting default model run to CauseMos with payload: {payload}"
            )
            response = requests.post(
                url,
                headers={"Content-Type": "application/json"},
                json=payload,
                auth=(causemos_user, causemos_pwd),
            )
            logger.info(f"Response from Uncharted: {response.text}")
            return

    except Exception as e:
        logger.error(f"Encountered problems communicating with Causemos: {e}")
        logger.exception(e)
