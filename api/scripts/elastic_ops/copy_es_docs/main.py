from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk

import argparse
import json
from pathlib import Path
from os.path import join as path_join

def get_project_root() -> Path:
    return Path(__file__).parent


def output_path(filename):
    return path_join(get_project_root(), "out", filename)


parser = argparse.ArgumentParser("copy documents->paragraphs from/to elasticsearch.")

parser.add_argument("--prod-es-host",
                    help="Elasticsearch host",
                    type=str, default="foobar:9207")

parser.add_argument("--local-es-host",
                    help="Elasticsearch host",
                    type=str, default="localhost:9200")

cli_args = parser.parse_args()

prod_es = Elasticsearch(f"http://{cli_args.prod_es_host}")
local_es = Elasticsearch(f"http://{cli_args.local_es_host}")


print(f"prod es: {prod_es.info()}\n")
print(f"local es: {local_es.info()}\n\n")


INDEX = 'documents'


def format_doc_hit(hit):
    return {
        "id": hit["_id"],
        **hit["_source"]
    }

def collect_document_data(all_data, doc_hits):
    return all_data + list(map(format_doc_hit, doc_hits))

docs_cache_file = output_path('documents_oct25_analyst.json')

def get_recent_relevant_document_ids():
    print("Called get recent document ids\n")

    es_body = {
        "query": {
            "match": {
                "filename": "DIDX-documents/"
            }
        },
        "sort": [
            {
                "uploaded_at": {
                    "order": "desc"
                }
            }
        ],
        "_source": ["title", "processed_at", "filename", "source_url", "description"]
    }

    total_processed = 0
    PAGE_SIZE = 150
    page_no = 0

    results = prod_es.search(index=INDEX, body=es_body, scroll="2m", size=PAGE_SIZE)

    hits = results["hits"]["hits"]

    all_data = []

    if len(hits):
        all_data = collect_document_data(all_data, hits)

    scroll_id = results["_scroll_id"]
    print(f"scroll id: {scroll_id}\n")

    while bool(scroll_id) and len(hits) >= PAGE_SIZE: # and len(all_data) < 1515:
        print("There are more results\n")
        print(f"Previous hits: {len(hits)}")
        page_no += 1
        print(f"Page no: {page_no}")

        results = prod_es.scroll(scroll_id=scroll_id, scroll="2m")
        hits = results["hits"]["hits"]
        scroll_id = results["_scroll_id"]

        if len(hits):
            all_data = collect_document_data(all_data, hits)

    with open(docs_cache_file, "w") as f:
        json.dump(all_data, f, indent=4)

    print(f"Done. Documents processed:", len(all_data))





# Only necessary if copying to diff elastic version or customizing index mapping
# def reformat_paragraph(doc_data, p_hit_data):
#     return {
#         "metadata": {
#             "source": doc_data["filename"],
#             "text": p_hit_data["text"],
#             "document_title": doc_data["title"],
#         },
#         "vector": p_hit_data["embeddings"],
#         "document_id": doc_data["id"],
#         "index": p_hit_data["index"],
#         "length": p_hit_data["length"],
#         "page_no": p_hit_data["page_no"],
#     }


def get_p_query(doc_id):
    return {
        "query": {
            "match": {"document_id.keyword": doc_id}
        },
        "sort": [
            {
                "index": {
                    "order": "asc"
                }
            }
        ]
    }

def copy_document_paragraphs():

    INDEX = "document_paragraphs"

    # load all doc data (incl ids) to var
    with open(docs_cache_file, 'r') as f:
        all_doc_data = json.load(f)

    # For each document-id,
    #     search&copy all document_paragraphs that have that document_id
    for document in all_doc_data:
        doc_id = document["id"]
        print(f"Parsing document id={doc_id}.")
        size = 6000
        p_query = get_p_query(doc_id)

        results = prod_es.search(index=INDEX, body=p_query, size=size)
        hits = results["hits"]["hits"]
        hits_count = len(hits)

        print(f"Found {hits_count} paragraphs for this document. Bulk uploading them.")

        # Use the bulk API to index the retrieved documents into the local instance
        bulk(
            client=local_es,
            actions=({
                "_index": INDEX,
                "_type": doc["_type"],
                "_id": doc["_id"],
                "_source": doc["_source"]
            } for doc in hits)
        )

        print("Finished saving all formatted paragraphs for current document.")

    print("Finished processing all documents, all paragraphs.")


if __name__ == "__main__":
    print("Select your main fn for various operations on the source file.")
    # NOTE uncomment one of:
    # get_recent_relevant_document_ids()
    # copy_document_paragraphs()

