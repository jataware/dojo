from .search import Search
from src.datasearch.corpora import Corpus, T, Generic
from typing import Union
from sentence_transformers import SentenceTransformer
import torch


class BertSentenceSearch(Search, Generic[T]):
    def __init__(self, corpus: Corpus[T], *, model='all-mpnet-base-v2', save_path='weights/bert_sentence_embedded_corpus.pt', cuda=True, batch_size=32):

        with torch.no_grad():
            self.model = SentenceTransformer(model)

            # move model to GPU
            if cuda:
                self.model = self.model.cuda()

        # save the device
        self.device = next(self.model.parameters()).device
        self.batch_size = batch_size

        # set up the corpus and compute tf-idf
        keyed_corpus = corpus.get_keyed_corpus()
        self.keys = list(keyed_corpus.keys())
        self.corpus = list(keyed_corpus.values())
        self.save_path = save_path
        self._build_embeddings()


    def _build_embeddings(self):
        #try to load the encoded corpus from disk
        try:
            self.embeddings = torch.load(self.save_path, map_location=self.device)
            print('Loaded bert sentence encoded corpus from disk')
            return
        except FileNotFoundError:
            pass

        print('encoding corpus with BERT sentence encoder')
        with torch.no_grad():
            self.embeddings = self.model.encode(self.corpus, show_progress_bar=True, device=self.device, convert_to_tensor=True, batch_size=self.batch_size)
            # torch.save(self.embeddings, self.save_path)

    def embed_query(self, query: str) -> torch.Tensor:
        with torch.no_grad():
            return self.model.encode(query, show_progress_bar=False, device=self.device, convert_to_tensor=True)

    def search(self, query:str, n:Union[int,None]=None) -> list[tuple[T, float]]:
        with torch.no_grad():
            encoded_query = self.embed_query(query)
            scores = torch.cosine_similarity(encoded_query[None,:], self.embeddings, dim=1)
            results = [(self.keys[i], scores[i].item()) for i in torch.argsort(scores, descending=True)]
            if n is not None:
                results = results[:n]
            return results
