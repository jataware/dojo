# import json
# import requests
# import shutil
# from data_processors import describe_df
# from utils import get_rawfile
# from settings import settings

import logging
from base_annotation import BaseProcessor
from elasticsearch import Elasticsearch

from datasearch.corpora import Corpus
from search.bert_search import BertSentenceSearch

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)

es = Elasticsearch("http://localhost:9200")
print(es.info())

print("Starting Embedder Engine")

corpus = Corpus.from_list(["a"])
engine = BertSentenceSearch(corpus, cuda=False)

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

    return engine.embed_query(description).tolist()

def saveAllOutputEmbeddings(indicatorDictionary, indicator_id):
    """
    Saves all outputs within an indicator to elasticsearch,
    including the LLM embeddings to use in search.
    """
    # indicatorDictionary = json.loads(indicatorPayload.json())

    for index, output in enumerate(indicatorDictionary["outputs"]):
        print(f"=== Transforming outputs # {index + 1}")

        feature = {
            **output,
            "embeddings": calcOutputEmbeddings(output),
            "owner_dataset": {
                "id": indicator_id,
                "name": indicatorDictionary["name"]
            }
        }

        feature_id = f"{indicator_id}-{output['name']}"

        # print(f"feature id: {feature_id}")
        # print(f"feature as dict: {feature}")

        return es.index(index="features-preview", body=feature, id=feature_id)


class EmbeddingsProcessor(BaseProcessor):
    @staticmethod
    def run(indicator_data, context={}):
        """
        Given an indicator dictionary with one or more outputs,
        processes its embeddings and stores result in es.
        """
        result = saveAllOutputEmbeddings(indicator_data["body"], indicator_data["id"])

        # potentially store result
        # result of:
# {'_index': 'features-preview', '_type': '_doc', '_id': '00000000-7d06-4270-aab0-aaaaaaaaaaaa-rockets', '_version': 1, 'result': 'created', '_shards': {'total': 2, 'successful': 1, 'failed': 0}, '_seq_no': 7, '_primary_term': 4}
        # print(f"result: {result}")
        return result["result"]


def calculate_store_embeddings(context):
    full_indicator = context["full_indicator"]
    indicator_id = context["indicator_id"]
    embedder = EmbeddingsProcessor()
    result = embedder.run(indicator_data={"body": full_indicator, "id": indicator_id})
    print(f"redis rq job result: {result}")
    return result
