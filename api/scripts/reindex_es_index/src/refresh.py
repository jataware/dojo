from elasticsearch import Elasticsearch
# from elasticsearch.helpers import bulk

# Define the Elasticsearch connection
es = Elasticsearch(['http://localhost:9200'])

# Define the index name
index_name = 'document_paragraphs_v2'

# Perform the asynchronous bulk indexing with refresh="wait_for"
# success, failed = bulk(es, actions, refresh="wait_for")
# print(f"Submitted {success + failed} documents for indexing.")

# Now, if you want to check the status of the index operation, you can query the index's status
index_status = es.indices.refresh(index=index_name)
print(f"Index operation status: {index_status}")
