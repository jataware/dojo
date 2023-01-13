
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

This will upload features alongside embeddings:

`python indicators_upload_features.py`



# Populating ElasticSearch Scripts

### Dart Documents

Download the data from Google Drive:

https://drive.google.com/drive/folders/1bUNoOTfefmYRuEWuaZhfOqQIyyMV72QE?usp=sharing

Three files and where to store them on this project:

- `dart_cdr.json_mar_2022` is the corpus of the papers in plain text (nested inside json structures**.
*Put this in the data/ folder*

- `DartPapers_sentence_embeddings.pt` is the embeddings of each of the paragraphs of each of the papers.
*Put this under weights/*

- `statements_2022_march_v4` is all of the concept matches/indra statements we were talking about.
*Store this in data/*

All data is about ~4GB total.

### Additional Dependencies

Requirements.txt contains dependencies to handle and create embeddings, but you'll need to
also have the `elasticsearch` python library available in your environment.

### Prerequisites

Create the `documents` and 	`document_paragraphs` indexes in elasticsearch:

```
PUT /documents
{
  "mappings": {
    "properties": {
      }
    }
  }
}
```

```
PUT /document_paragraphs
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

## Scripts

The script files point to hardcoded local elasticsearch urls.

To upload document metadata to es, run:

`python upload_all_document_metadata.py`

To upload paragraph text and llm embeddings to es:

`python upload_paragraphs_embeddings.py`
