from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk


# NOTE es for local, use 9201 thorough ssh tunnel for prod!?:
es = Elasticsearch(['http://localhost:9200'])


# DART documents have this PascalCase field:
with_target_field = 'CreationDate'

PAGE_SIZE = 1000

search_query = {
    "query": {
        "exists": {
            "field": with_target_field
        }
    }
}


index_name = 'document_paragraphs'

search_query_p = {
    "query": {
        "match_all": {}
    }
}

# I couldn't loop painlessly...
# For Documents
painless_script = {
    "lang": "painless",
    "source": """

      def updated = [:];

      updated.producer = ctx._source.Producer;
      updated.creation_date = ctx._source.CreationDate;
      updated.mod_date = ctx._source.ModDate;
      updated.description = ctx._source.Description;
      updated.type = ctx._source.Type;
      updated.original_language = ctx._source.OriginalLanguage;
      updated.classification = ctx._source.Classification;
      updated.author = 'DART';
      updated.title = ctx._source.Title;
      updated.publisher = ctx._source.Publisher;
      updated.stated_genre = ctx._source.StatedGenre;
      updated.filename = ctx._source.FileName;

      ctx._source.clear();
      ctx._source.putAll(updated);
    """
}


def bulk_update_paragraphs(hits):
    # Process search results and prepare bulk update actions
    bulk_actions = []
    for hit in hits:
        p_id = hit['_id']
        p_index = int(hit["_id"].split("-")[-1])

        update_action = {
            "_op_type": "update",
            "_index": "document_paragraphs",
            "_id": p_id,
            "doc": {
                "index": p_index
            }
        }
        bulk_actions.append(update_action)

    # Perform BULK UPDATE
    success, failed = bulk(es, bulk_actions)

    print(f"Successfully updated {success} document_paragraphs.")
    print(f"Failed to update {failed} document_paragraphs.")


def bulk_update_docs(hits):
    # Process search results and prepare bulk update actions
    bulk_actions = []
    for hit in hits:
        doc_id = hit['_id']
        update_action = {
            "_op_type": "update",
            "_index": index_name,
            "_id": doc_id,
            "script": painless_script,
        }
        bulk_actions.append(update_action)

    # Perform BULK UPDATE
    success, failed = bulk(es, bulk_actions)

    print(f"Successfully updated {success} documents.")
    print(f"Failed to update {failed} documents.")



def update_documents():
    search_results = es.search(index=index_name, body=search_query, size=PAGE_SIZE, scroll="5m")

    print(f"\n\n**==** search results:\\n{search_results['hits']['total']['value']}\n\n")

    hits = search_results['hits']['hits']

    scroll_id = search_results["_scroll_id"]

    if len(hits):
        bulk_update_docs(hits)

    while bool(scroll_id) and len(hits) >= PAGE_SIZE:
        print("There are more results\n")

        # new results
        results = es.scroll(scroll_id=scroll_id, scroll="2m")
        hits = results["hits"]["hits"]
        scroll_id = results["_scroll_id"]

        if len(hits):
            bulk_update_docs(hits)


def update_paragraphs():
    search_results = es.search(index=index_name, body=search_query_p, size=PAGE_SIZE, scroll="2m")

    print(f"\n\n**==** Search Results Count:\\n{search_results['hits']['total']['value']}\n\n")

    hits = search_results['hits']['hits']

    scroll_id = search_results["_scroll_id"]

    if len(hits):
        bulk_update_paragraphs(hits)

    while bool(scroll_id) and len(hits) >= PAGE_SIZE:
        print("There are more results\n")

        # new results
        results = es.scroll(scroll_id=scroll_id, scroll="2m")
        hits = results["hits"]["hits"]
        scroll_id = results["_scroll_id"]

        if len(hits):
            bulk_update_paragraphs(hits)


if __name__ == '__main__':
    update_paragraphs()

# import pprint
# pp = pprint.PrettyPrinter(indent=2)
# pp.pprint(update_result)

