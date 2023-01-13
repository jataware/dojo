import json
from typing import List, Tuple
from .src.datasearch.corpora import Corpus, CorpusLoader

class DartPapers(CorpusLoader):
    @staticmethod

    def get_metadata():

        with open('data/dart_cdr.json_mar_2022') as f:
            lines = f.readlines()

        docs = {}
        for i, line in enumerate(lines):
            doc = json.loads(line)
            id = doc['document_id']

            try:
                metadata = doc['extracted_metadata']
            except:
                print(f'get_metadata: Error parsing document {id} on line {i}. No extracted metadata.')
                continue

            docs[id] = {**metadata}

        return docs


    def get_corpus() -> Corpus[str]:

        # check if the class already made a singleton copy of the data
        if hasattr(DartPapers, 'corpus'):
            return DartPapers.corpus


        with open('data/dart_cdr.json_mar_2022') as f:
            lines = f.readlines()

        docs = {}
        for i, line in enumerate(lines):
            doc = json.loads(line)
            id = doc['document_id']

            try:
                text = doc['extracted_text']
            except:
                print(f'error parsing document {id} on line {i}. No extracted text.')
                continue

            docs[id] = text

        # save singleton copy of the data
        DartPapers.corpus = Corpus(docs)

        return DartPapers.corpus

    @staticmethod
    def get_paragraph_corpus() -> Corpus[Tuple[str,int]]:
        corpus = DartPapers.get_corpus()
        return Corpus.chunk(corpus, DartPapers.chunk_paragraphs)

    @staticmethod
    def get_sentence_corpus() -> Corpus[Tuple[str,int,int]]:
        corpus = DartPapers.get_corpus()
        return Corpus.chunk(corpus, DartPapers.chunk_sentences)


    @staticmethod
    def chunk_paragraphs(doc:str) -> List[str]:
        """split the document on paragraphs (separated by newlines)"""
        paragraphs = [*filter(len, doc.split('\n'))] #remove empty paragraphs
        return paragraphs

    #TODO: how to handle abbreviations, other periods that aren't sentence endings?
    @staticmethod
    def chunk_sentences(doc:str) -> List[str]:
        """split the document on sentences (separated by periods)"""
        raise NotImplementedError
