from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk

# import json
# from pathlib import Path
# from os.path import join as path_join

# import random

# def get_project_root() -> Path:
#     return Path(__file__).parent


local_es = Elasticsearch("http://localhost:9200")

INDEX = "document_paragraphs"


"""
Script to inject paragraphs with similar document_ids
in order to ensure the es query does not fuzzy match document_ids and
return paragraphs for the wrong documents.

"""

document_ids = [
    "9c02ef21-350d-4681-mock-586c3e530ae4",
    "8c02ef21-350d-4681-mock-586c3e530ae4",
    "9c02ef21-350d-4681-mock-586c3e530ae5",
    "9c02ef21-384d-4681-mock-586c3e530ae5",
    "9c02ef21-350d-4681-mock-586c3e530ae4",
]


def get_paragraph_body(document_id, nth, text):
    # score = random.uniform(0, 2)

    return {
        "_index": INDEX,
        "_type": "_doc",
        "_id": f"{document_id}-{nth}",
        # "_score": score,
        "_source": {
          "length": len(text),
          "index": nth,
          "text": text,
          "page_no": nth % 5,
          "document_id": document_id
        }
      }


all_text = [
    "I am a poem",
    "in my dreams, I certify that I can do absolutely anything",
    "sometimes I am not sure if I am dreaming"
]


def generate_paragraphs():
    all_p = []
    for doc_id in document_ids:
        for text_idx, text in enumerate(all_text):
            new_p = get_paragraph_body(doc_id, text_idx, text)
            all_p.append(new_p)

    # all_p has all ps
    bulk(
        client=local_es,
        actions=({
            "_index": INDEX,
            "_type": doc["_type"],
            "_id": doc["_id"],
            "_source": doc["_source"]
        } for doc in all_p)
    )


if __name__ == "__main__":
    generate_paragraphs()
