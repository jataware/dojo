import re
from datasearch.corpora import Corpus, T, Generic
from .search import Search
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class PlaintextSearch(Search, Generic[T]):
    """simple text based implementation of TF-IDF"""
        
    def __init__(self, corpus: Corpus[T]):
        keyed_corpus = corpus.get_keyed_corpus()
        self.keys = list(keyed_corpus.keys())
        self.corpus = list(keyed_corpus.values())
        self._build_tf_idf()

    def _extract_words(self, text:str) -> list[str]:
        return [word.lower() for word in re.findall(r'\w+', text)]
    
    def _build_tf_idf(self):
        # extract all words in the corpus using regex
        corpus_words = [self._extract_words(text) for text in self.corpus]
        
        # compute term frequency per each document
        self.tf = []
        for doc_words in corpus_words:
            doc_tf = {}
            for word in doc_words:
                doc_tf[word] = doc_tf.get(word, 0) + 1
            self.tf.append(doc_tf)

        # compute inverse document frequency for each word
        self.idf = {}
        for doc_tf in self.tf:
            for word in doc_tf:
                self.idf[word] = self.idf.get(word, 0) + 1
        for word in self.idf:
            self.idf[word] = len(self.tf) / self.idf[word]

        # compute tf-idf for each word in each document
        self.tf_idf = []
        for doc_tf in self.tf:
            doc_tf_idf = {}
            for word in doc_tf:
                doc_tf_idf[word] = doc_tf[word] * self.idf[word]
            self.tf_idf.append(doc_tf_idf)


    def search(self, query:str, n:int=None) -> list[tuple[T, float]]:
        # extract words from the query
        query_words = self._extract_words(query)
        
        # compute tf-idf for the query
        results = []
        for key, doc_tf_idf in zip(self.keys, self.tf_idf):
            score = 0
            for word in query_words:
                score += doc_tf_idf.get(word, 0)
            if score > 0:
                results.append((key, score))
        
        results.sort(key=lambda x: x[1], reverse=True)

        if n is not None:
            results = results[:n]

        return results





class SklearnSearch(Search, Generic[T]):
    """sklearn based implementation of TF-IDF"""
    def __init__(self, corpus: Corpus[T]):
        keyed_corpus = corpus.get_keyed_corpus()
        self.keys = list(keyed_corpus.keys())
        self.corpus = list(keyed_corpus.values())
        self.vectorizer = TfidfVectorizer()
        self.tf_idf = self.vectorizer.fit_transform(self.corpus)


    def search(self, query:str, n:int=None) -> list[tuple[T, float]]:
        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self.tf_idf)[0]
        results = [(key, score) for key, score in zip(self.keys, scores) if score > 0]
        results.sort(key=lambda x: x[1], reverse=True)

        if n is not None:
            results = results[:n]

        return results
