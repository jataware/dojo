from elasticsearch import Elasticsearch


def create_and_reindex_index(es, index_name, version, new_mappings):
    """
    """
    # Create a new index with the given mappings
    new_index_name = f"{index_name}_v{version + 1}"
    es.indices.create(index=new_index_name, body={"mappings": new_mappings})

    # Reindex data from the old index to the new index
    reindex_body = {
        "source": {"index": index_name},
        "dest": {"index": new_index_name}
    }
    es.reindex(body=reindex_body, wait_for_completion=True)

    # Delete the old index
    es.indices.delete(index=index_name)

    # Create an alias using the index_name for the new index
    es.indices.put_alias(index=new_index_name, name=index_name)


if __name__ == "__main__":
    index_name = input("Enter the index name: ")
    version = int(input("Enter the current version: "))

    # !WARNING! PLEASE READ
    # NOTE Set your new index settings/mappings here!
    # These are just a sample/from previous use.
    new_mappings = {
        "settings": {
            "index": {
                "sort.field": "uploaded_at",
                "sort.order": "desc"
            }
        },
        "mappings": {
            "properties": {
                "title": {
                    "type": "text",
                    "fields": {
                        "lowersortable": {
                            "type": "keyword",
                            "normalizer": "lowercase"
                        }
                    }
                },
                "publisher": {
                    "type": "text",
                    "fields": {
                        "lowersortable": {
                            "type": "keyword",
                            "normalizer": "lowercase"
                        }
                    }
                },
                "creation_date": {
                    "type": "date"
                },
                "uploaded_at": {
                    "type": "date"
                },
                "processed_at": {
                    "type": "date"
                }
            }
        }
    }

    es = Elasticsearch([{'host': 'localhost', 'port': 9200}])  # Update with your Elasticsearch connection details

    create_and_reindex_index(es, index_name, version, new_mappings)

    print("Index creation, reindexing, and aliasing complete.")
