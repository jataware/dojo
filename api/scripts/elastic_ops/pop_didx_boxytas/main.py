#!/usr/bin/env python
from elasticsearch import Elasticsearch
# from dotenv import load_dotenv
from pathlib import Path
import numpy as np
import re
import os
from os.path import join as path_join
# import pprint

"""
Script to process mmd|npy files, generated from PDF files, from the
`dojo/documents` folder. It requires an ES /paragraphs index (or modify file).
See the index mappings example at the bottom of this file.

It also matches existing ES documents IDs by filenames, which is very specific
to our DIDX documents sample. All in all, this is useful for the DIDX documents
to consolidate out various LLM-based services- semantic search, 
causal recommender, knowledge UI, with the idea that eventually the 
Dojo Document Upload UI/pipeline will handle file upload and processing using
the newer mmd|Nougat|embeddings engine.

Run both locally and when conforming the Dojo deployment stack to the new
embeddings and document text.
"""

# load_dotenv()
# pp = pprint.PrettyPrinter(indent=2)
es = Elasticsearch("http://localhost:9200")

print(es.info())

elastic_ops_dir = Path(__file__).resolve().parent.parent
api_dir = Path(elastic_ops_dir).parent.parent
dojo_dir = Path(api_dir).parent
docs_dir = path_join(dojo_dir, "documents")


print(f"docs_dir: {docs_dir}")


MIN_WORDS = 25
ES_INDEX_NAME = "paragraphs"


def get_unique_filenames_without_pdf_extension(directory_path):
    pdf_files = [f for f in os.listdir(directory_path) if f.endswith('.pdf')]
    unique_filenames = set([os.path.splitext(f)[0] for f in pdf_files])
    return list(unique_filenames)


def is_too_short(paragraph: str, min_words: int) -> bool:
    """Paragraph filter for checking if a paragraph is too short"""
    return len(paragraph.split()) < min_words


def is_citation(paragraph: str) -> bool:
    """paragraph filter for checking if a paragraph is a citation section"""
    patterns = [
        r"\*.*\(\d{4}\).*:.*\.",
        r"\*\s\[[^\]]+\d{4}\].*\.",
        r"\*\s\[[^\]]*\][^(\d{4})]*\d{4}.*",
        r"\*\s.*\d{4}.*\.\s(?:http|www)\S+",
        r"\*.*\d{4}\.\s[_\*]?[A-Za-z0-9][^\*]*?[_\*]?\.\s.*?\.",
    ]
    pattern = f'({")|(".join(patterns)})'
    lines = paragraph.split('\n')
    # count the number of lines that match the pattern
    num_matches = sum([1 for line in lines if re.match(pattern, line)])
    return num_matches > len(lines)/2


def convert_to_paragraphs(text):
    paragraph_filter = lambda p: not is_too_short(p, MIN_WORDS) and not is_citation(p)
    paragraphs = list(filter(paragraph_filter, text.split('\n\n')))
    return paragraphs


def get_text_embeddings_for(filename):
    text_file = path_join(docs_dir, f"{filename}.mmd")
    text = Path(text_file).read_text()
    paragraphs = convert_to_paragraphs(text)
    embeddings = np.load(path_join(docs_dir, f"{filename}.npy"))
    # Now each index match paragraph and embeddings
    return (paragraphs, embeddings)


def upload_paragraph(doc_id, paragraph, embeddings_for_p, p_index):
    p_id = f"{doc_id}-{p_index}"

    print("Uploading paragraph with following ID:")
    print(p_id)
    print("Embeddings vector length:")
    print(len(embeddings_for_p))
 
    es.index(
        index=ES_INDEX_NAME,
        body={
            "text": paragraph,
            "document_id": doc_id,
            "embeddings": embeddings_for_p.tolist(),
            "length": len(paragraph),
            "index": p_index,
            "page_no": None
        },
        id=p_id)


def get_doc_id_from_filename(filename):
    query = {
        "query": {
            "match": {
                "filename": filename
            }
        }
    }
    res = es.search(index="documents", body=query)
    id = res["hits"]["hits"][0]["_id"]
    return id


def upload_paragraphs():
    # Read dojo/documents, get unique XXXX.pdf names (1515 ish)
    filenames = get_unique_filenames_without_pdf_extension(docs_dir)
    print(f"file count: {len(filenames)}")

    # Read files on dojo/documents NPY|MMD per each pdf doc name
    for filename in filenames:
        # get document id from es
        doc_id = get_doc_id_from_filename(filename)

        (all_paragraphs_texts, embeddings_for_all_p) = get_text_embeddings_for(filename)

        # loop through each Paragraph
        for p_idx, paragraph_text in enumerate(all_paragraphs_texts):
            upload_paragraph(
                doc_id,
                paragraph_text,
                embeddings_for_all_p[p_idx],
                p_idx
            )
    return 0


if __name__ == "__main__":
    upload_paragraphs()
    exit(0)


# ES Index creation with proper mappings:
"""
PUT /paragraphs
{
  "mappings": {
      "properties": {
        "document_id": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "embeddings": {
          "type": "dense_vector",
          "dims": 1536
        },
        "index": {
          "type": "long"
        },
        "length": {
          "type": "long"
        },
        "page_no": {
          "type": "long"
        },
        "text": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        }
      }
    }
} 
"""
