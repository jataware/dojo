import logging
from base_annotation import BaseProcessor
from elasticsearch import Elasticsearch
# import os
from settings import settings
from jatarag.embedder import AdaEmbedder
embedder = AdaEmbedder()

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)

es_url = settings.ELASTICSEARCH_URL
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
    return embedder.embed_paragraphs([description])[0]


def saveAllOutputEmbeddings(indicatorDictionary, indicator_id):
    """
    Saves all outputs within an indicator to elasticsearch,
    including the LLM embeddings to use in search.
    """

    logging.info("Save all output embeddings called.")
    logging.info(f"Input dictionary: {indicatorDictionary}")

    for index, output in enumerate(indicatorDictionary["outputs"]):

        feature = {
            **output,
            "embeddings": calcOutputEmbeddings(output),
            "owner_dataset": {
                "id": indicator_id,
                "name": indicatorDictionary["name"]
            }
        }

        feature_id = f"{indicator_id}-{output['name']}"

        es.index(index="features", body=feature, id=feature_id)

    return True


class EmbeddingsProcessor(BaseProcessor):
    @staticmethod
    def run(indicator_data, context={}):
        """
        Given an indicator dictionary/id with one or more outputs,
        processes its embeddings and stores results in es.
        """
        result = saveAllOutputEmbeddings(indicator_data["body"], indicator_data["id"])

        return result


def calculate_store_embeddings(context):
    """
    Context should include a full_indicator indicator dictionary (see
    elasticsearch for examples) and an indicator_id (uuid).
    """

    logging.info(f"Starting embeddings job for indicator. All context: {context}\n")

    indicator_id = context["indicator_id"]
    full_indicator = context["full_indicator"]

    processor = EmbeddingsProcessor()
    result = processor.run(indicator_data={"body": full_indicator, "id": indicator_id})

    logging.info(f"Job result for indicator {indicator_id}: {result}\n")

    return result
