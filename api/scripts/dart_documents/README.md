

# Populating ElasticSearch Dart Documents

Download the data from Google Drive:

https://drive.google.com/drive/folders/1bUNoOTfefmYRuEWuaZhfOqQIyyMV72QE?usp=sharing

Three files and where to store them, relative to this file's directory:

For creating dataset metadata only:
- `dart_cdr.json_mar_2022` is the corpus of the papers in plain text (nested inside json structures**.
*Put this in the ./data/ folder*

For uploading paragraphs that belong to documents created above.
- `DartPapers_sentence_embeddings.pt` is the embeddings of each of the paragraphs of each of the papers.
*Put this under ./weights/bert_sentence_embedded_corpus.pt* <- Ensure to rename to correct filename.

- `statements_2022_march_v4` is all of the concept matches/indra statements we were talking about.
*Store this under ./data/*

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
      },
      "length": {
        "type": "short"
      }
    }
  }
}
```

## Scripts

The script files point to hardcoded local elasticsearch urls.

To upload document metadata to es, from the same dir as README run:

`poetry run upload_documents`



TODO:
To upload paragraph text and llm embeddings to es:

`poetry run upload_doc_paragraphs`

