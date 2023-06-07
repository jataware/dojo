
This folder contains utility scripts in order to assess data state or loss, as well as populate development elasticsearch instance with some data quickly. That is, it'll help add indicators (datasets) using world bank datasets, popoulate the features index using exising datasets, create reports if causemos is missing datasets on their side, provide comparisons for various hybrid search queries for feature search, as well as populate the documents and document_paragraphs indexes for the document explorer.

# Creating and populating a new Features index from Indicators index

### Create `features` index

```
PUT /features
{
  "mappings": {
    "properties": {
      "embeddings": {
        "type": "dense_vector",
        "dims": 768
      }
    }
  }
}
```

### Loop through indicators and upload Features

cd to `semantic_dataset_search`

This will upload features with their embeddings:

`python semantic_work/populate_features_index.py`
