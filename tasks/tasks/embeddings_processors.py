import logging
from base_annotation import BaseProcessor
from elasticsearch import Elasticsearch
import os
import uuid
from embedder_engine import embedder

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)

es_url = os.environ.get("ELASTICSEARCH_URL", "http://localhost:9200")
es = Elasticsearch(es_url)


def calcOutputEmbeddings(output):
    """
    Embeddings are created from a subset of the output properties:
    - name, display_name, description, unit, unit_description.
    """
    description = \
        f"""name: {output['name']};
        display name: {output['display_name']};
        description: {output['description']};
        unit: {output['unit']};
        unit description: {output['unit_description']};"""

    # Embedder can embed list of strings. We only pass one,
    # so we retrieve the one entry on the output array
    return embedder.embed([description])[0]

def saveAllOutputEmbeddings(indicatorDictionary, indicator_id):
    """
    Saves all outputs within an indicator to elasticsearch,
    including the LLM embeddings to use in search.
    """
    for index, output in enumerate(indicatorDictionary["outputs"]):
        feature = {
            **output,
            "embeddings": calcOutputEmbeddings(output),
            "owner_dataset": {
                "id": indicator_id,
                "name": indicatorDictionary["name"]
            }
        }

        feature_id = str(uuid.uuid4())
        return es.index(index="features", body=feature, id=feature_id)


class EmbeddingsProcessor(BaseProcessor):
    @staticmethod
    def run(indicator_data, context={}):
        """
        Given an indicator dictionary/id with one or more outputs,
        processes its embeddings and stores results in es.
        """
        result = saveAllOutputEmbeddings(indicator_data["body"], indicator_data["id"])

        return result["result"]


def calculate_store_embeddings(context):
    """
    Context should include a full_indicator indicator dictionary (see
    elasticsearch for examples) and an indicator_id (uuid).
    """
    indicator_id = context["indicator_id"]
    full_indicator = context["full_indicator"]

    print(f"Starting embeddings job for indicator: {indicator_id}\n")

    embedder = EmbeddingsProcessor()
    result = embedder.run(indicator_data={"body": full_indicator, "id": indicator_id})

    print(f"Job result for indicator {indicator_id}: {result}\n")

    return result
