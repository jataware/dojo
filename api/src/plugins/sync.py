import json

import requests
from fastapi.logger import logger
from src.plugins import PluginInterface
from src.indicators import patch_indicator
from src.data import get_context
from validation import IndicatorSchema


class SyncPlugin(PluginInterface):

    # Sync annotations to indicators
    def publish(self, data, type="indicator"):
        if type == "indicator":
            uuid = data["id"]
            context = get_context(uuid)

            # Outputs
            qualifier_outputs = []
            outputs = []
            feature_names = []
            for feature in context["annotations"]["annotations"]["feature"]:

                feature_names.append(
                    feature["name"]
                )  # Used for the primary qualifier outputs.
                output = dict(
                    name=feature["name"],
                    display_name=feature["display_name"],
                    description=feature["description"],
                    type=feature["feature_type"],
                    unit=feature["units"],
                    unit_description=feature["units_description"],
                    ontologies={},
                    is_primary=True,
                    data_resolution={
                        "temporal_resolution": context.get("dataset", {}).get(
                            "temporal_resolution", None
                        ),
                        "spatial_resolution": context.get("dataset", {}).get(
                            "spatial_resolution", None
                        )  # This logic can be removed when there are no longer two types of spatial resolution in dojo (meters and degrees)
                        if isinstance(
                            context.get("dataset", {}).get("spatial_resolution", None),
                            list,
                        )
                        else [
                            context.get("dataset", {}).get("spatial_resolution", None)
                        ]
                        if context.get("dataset", {}).get("spatial_resolution", None)
                        is not None
                        else [],
                    },
                    alias=feature["aliases"],
                )
                # Append
                # TODO: Hackish way to determine that the feature is not a qualifier
                if feature.get("qualifies", None):
                    if len(feature["qualifies"]) == 0:
                        outputs.append(output)
                        # Qualifier output for qualifying features
                    elif len(feature["qualifies"]) > 0:
                        qualifier_output = dict(
                            name=feature["name"],
                            display_name=feature["display_name"],
                            description=feature["description"],
                            # Gross conversion between the two output types.
                            type=(
                                "str"
                                if feature["feature_type"] == "string"
                                else "binary"
                                if feature["feature_type"] == "boolean"
                                else feature["feature_type"]
                            ),
                            unit=feature["units"],
                            unit_description=feature["units_description"],
                            ontologies={},
                            related_features=feature["qualifies"],
                        )
                        # Append to qualifier outputs
                        qualifier_outputs.append(qualifier_output)
                else:
                    outputs.append(output)

            # Qualifier_outputs
            for date in context["annotations"]["annotations"]["date"]:
                if date["primary_date"]:
                    qualifier_output = dict(
                        name=date["name"],
                        display_name=date["display_name"],
                        description=date["description"],
                        type="datetime",
                        unit=date.get("units", None),
                        unit_description=date.get("units_description", None),
                        ontologies={},
                        related_features=feature_names,
                        # Extra field (Schema allows extras)
                        qualifier_role="breakdown",
                    )
                    # Append
                    qualifier_outputs.append(qualifier_output)

            # TODO potentially update description dynamically if present in annotations
            for geo_str in ["country", "admin1", "admin2", "admin3", "lat", "lng"]:
                qualifier_output = dict(
                    name=geo_str,
                    display_name=geo_str,
                    description="location",
                    type=geo_str,
                    unit=None,
                    unit_description=None,
                    ontologies={},
                    related_features=feature_names,
                    # Extra field (Schema allows extras)
                    qualifier_role="breakdown",
                )
                # Append
                qualifier_outputs.append(qualifier_output)

        response = {
            "id": uuid,
            "name": context["dataset"]["name"],
            "description": context["dataset"]["description"],
            "maintainer": context["dataset"]["maintainer"],
            "outputs": outputs,
            "qualifier_outputs": qualifier_outputs,
            "feature_names": feature_names,
            "published": True,
        }

        schema = IndicatorSchema.IndicatorMetadataSchema.parse_obj(response)

        patch_indicator(schema, uuid)
