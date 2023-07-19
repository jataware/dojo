import json
import os
from copy import deepcopy

import requests
from fastapi.logger import logger
from src.dojo import get_parameters
from src.ontologies import get_ontologies
from src.plugins import PluginInterface
from validation import ModelSchema

from src.settings import settings
from src.models import model_versions
from src.data import get_context

class CausemosPlugin(PluginInterface):
    def publish(self, data, type):
        if settings.DEBUG:
            return

        logger.info(f"\n ===== CausemosPlugin `publish` method running with data: {data}")

        if type == "model":
            notify_data = convert_to_causemos_format(data)

            # On the notification step only, we want to include any previous versions so that they can be deprecated
            previous_versions = model_versions(data["id"])["prev_versions"]

            notify_data["deprecatesIDs"] = previous_versions

            # Notify causemos of the new model
            self.notify_causemos(data=notify_data, entity_type="model")

            # Send CauseMos a default run
            logger.info("Submitting default run to CauseMos")
            self.submit_run(notify_data)

        if type == "indicator":
            uuid = data["id"]
            full_context = get_context(uuid)
            # Notify causemos of the new indicator
            self.notify_causemos(data=full_context["dataset"], entity_type="indicator")


    def notify_causemos(self, data, entity_type="indicator"):
        """
        A function to notify Causemos that a new indicator or model has been created.

        If entity_type is "indicator":
            POST https://causemos.uncharted.software/api/maas/indicators/post-process
            // Request body: indicator metadata

        If entity_type is "model":
            POST https://causemos.uncharted.software/api/maas/datacubes
            // Request body: model metadata
        """
        headers = {"accept": "application/json", "Content-Type": "application/json"}

        if entity_type == "indicator":
            endpoint = "indicators/post-process"
        elif entity_type == "model":
            endpoint = "datacubes"

        url = f'{os.getenv("CAUSEMOS_IND_URL")}/{endpoint}'
        causemos_user = os.getenv("CAUSEMOS_USER")
        causemos_pwd = os.getenv("CAUSEMOS_PWD")

        try:
            # Notify Uncharted
            if os.getenv("CAUSEMOS_DEBUG") == "true":
                logger.info("CauseMos debug mode: no need to notify Uncharted")
                return
            else:
                logger.info(f"Notifying CauseMos of {entity_type} creation...")
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


    def submit_run(self, model):
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

        headers = {"accept": "application/json", "Content-Type": "application/json"}
        endpoint = "model-runs"
        url = f'{os.getenv("CAUSEMOS_IND_URL")}/{endpoint}'
        causemos_user = os.getenv("CAUSEMOS_USER")
        causemos_pwd = os.getenv("CAUSEMOS_PWD")

        params = []
        for param in model.get("parameters", []):
            param_obj = {}
            param_obj["name"] = param["name"]
            param_obj["value"] = param["default"]
            params.append(param_obj)

        payload = {
            "model_id": model["id"],
            "model_name": model["name"],
            "is_default_run": True,
            "parameters": params,
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


    def post_update(self, data, type):

        from ..indicators import get_indicators

        if type == "deprecate":
            indicator_payload = get_indicators(data["id"])

            if indicator_payload["deprecated"]:
                publish(data, type="model")


def to_parameter(annot):
        """
        Transform Dojo annotation into a Causemos parameter.
        """
        return {
            "name": annot["name"],
            "display_name": annot["name"],
            "description": annot["description"],
            "type": annot["type"],
            "unit": annot["unit"],
            "unit_description": annot["unit_description"],
            "ontologies": None,
            "is_drilldown": None,
            "additional_options": None,
            "data_type": annot["data_type"],
            "default": annot["default_value"],
            "choices": annot["options"] if annot["predefined"] else None,
            # NOTE: Do we want to store these as strings internally?
            "min": float(annot["min"]) if annot["min"] != "" else None,
            "max": float(annot["max"]) if annot["max"] != "" else None,
        }


def convert_to_causemos_format(model):
    """
    Transforms model from internal representation to the representation
    accepted by Cauesmos.
    """
    causemos_model = deepcopy(model)
    causemos_model["parameters"] = [
        to_parameter(parameters["annotation"])
        for parameters in get_parameters(model["id"])
    ]
    causemos_model = get_ontologies(causemos_model, type="model")
    payload = ModelSchema.CausemosModelMetadataSchema(**causemos_model)
    return json.loads(payload.json())
