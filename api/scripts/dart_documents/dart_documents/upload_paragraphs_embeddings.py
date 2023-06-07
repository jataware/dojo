from dart_papers import DartPapers
from bert_search import BertSentenceSearch

from elasticsearch import Elasticsearch

es = Elasticsearch("http://localhost:9200")

print(es.info())

paragraph_corpus = DartPapers.get_paragraph_corpus()
engine = BertSentenceSearch(paragraph_corpus, save_name=DartPapers.__name__, cuda=False)

# Index all paragraphs to elasticsearch
for key, embedding in engine:

    document_id, paragraph_index = key # second parameter is paragraph index

    paragraph = paragraph_corpus[key]

    p_id = f"{document_id}-{paragraph_index}"

    print(f"Paragraph id: {p_id}")

    es.index(index="document_paragraphs",
             body={
                 "text": paragraph,
                 "document_id": document_id,
                 "embeddings": embedding.tolist(),
                 "length": len(paragraph)
             },
             id=p_id)
