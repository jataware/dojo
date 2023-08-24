from elasticsearch import Elasticsearch


def create_and_reindex_index(es, index_name, version, new_index_config):
    """
    """
    new_index_name = f"{index_name}_v{version + 1}"

    print(f"Creating new index: {new_index_name}.")

    es.indices.create(index=new_index_name, body=new_index_config)

    print(f"Indexing data from {index_name} to: {new_index_name}.")

    reindex_body = {
        "source": {"index": index_name},
        "dest": {"index": new_index_name}
    }
    es.reindex(body=reindex_body, wait_for_completion=True)

    print(f"Now delete old '{index_name}'.")

    es.indices.delete(index=index_name)

    print(f"Finally, create alias to use {index_name} for {new_index_name}.")

    es.indices.put_alias(index=new_index_name, name=index_name)


if __name__ == "__main__":
    index_name = "document_paragraphs" # Set your index here
    current_version = 1                        # Set current version here

    # !WARNING! PLEASE READ
    # NOTE Set your new index settings/mappings here!
    # These are just a sample/from previous use.

    # Sample up upgrade documents index to v2
    # new_index_config = {
    #     "settings": {
    #         "index": {
    #             "sort.field": "uploaded_at",
    #             "sort.order": "desc"
    #         }
    #     },
    #     "mappings": {
    #         "properties": {
    #             "title": {
    #                 "type": "text",
    #                 "fields": {
    #                     "lowersortable": {
    #                         "type": "keyword",
    #                         "normalizer": "lowercase"
    #                     }
    #                 }
    #             },
    #             "publisher": {
    #                 "type": "text",
    #                 "fields": {
    #                     "lowersortable": {
    #                         "type": "keyword",
    #                         "normalizer": "lowercase"
    #                     }
    #                 }
    #             },
    #             "creation_date": {
    #                 "type": "date"
    #             },
    #             "uploaded_at": {
    #                 "type": "date"
    #             },
    #             "processed_at": {
    #                 "type": "date"
    #             }
    #         }
    #     }
    # }

    # TODO put in your es index config here
    # See examples around this line.
    new_index_config = {}

    # For document_paragraphs_v2:
    # new_index_config = {
    #     "mappings": {
    #         "properties": {
    #             "embeddings": {
    #                 "type": "dense_vector",
    #                 "dims": 768
    #             },
    #             "document_id": {
    #                 "type": "keyword",
    #                 "index": True,
    #                 "doc_values": True,
    #                 "norms": False,
    #                 "fields": {
    #                     "partial": {
    #                         "type": "search_as_you_type"
    #                     }
    #                 }
    #             },
    #             "length": {
    #                 "type": "short"
    #             },
    #             "index": {
    #                 "type": "long"
    #             },
    #             "page_no": {
    #                 "type": "long"
    #             }
    #         }
    #     }
    # }

    es = Elasticsearch([{'host': 'localhost', 'port': 9200}],
                       timeout=30,         # Adjust this as needed
                       max_retries=3       # Adjust this as needed
                       )  # Update with your Elasticsearch connection details

    create_and_reindex_index(es, index_name, current_version, new_index_config)

    print("Index creation, reindexing, and aliasing complete.")
