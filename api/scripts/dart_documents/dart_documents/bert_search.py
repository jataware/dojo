from math import prod
from search import Search
from corpora import Corpus, T, Generic
from typing import Union, Callable
from transformers import BertTokenizer, BertModel, logging # type: ignore[import]
from sentence_transformers import SentenceTransformer
import torch
from tqdm import tqdm
from os.path import join
import multiprocessing


class BertWordSearch(Search, Generic[T]):
    """neural TF-IDF search based on BERT"""
    def __init__(self, corpus: Corpus[T], *, model='bert-base-uncased', save_path='weights/bert_word_embedded_corpus.pt', chunk_size=100, cuda=True):

        # load BERT tokenizer and model from HuggingFace
        with torch.no_grad():
            logging.set_verbosity_error()
            self.tokenizer = BertTokenizer.from_pretrained(model)
            self.model = BertModel.from_pretrained(model)

            # move model to GPU
            if cuda:
                self.model = self.model.cuda()

        # save the device
        self.device = next(self.model.parameters()).device

        # set up the corpus and compute tf-idf
        keyed_corpus = corpus.get_keyed_corpus()
        self.keys = list(keyed_corpus.keys())
        self.corpus = list(keyed_corpus.values())
        self.save_path = save_path
        self._build_tf_idf()

        self.chunk_size = chunk_size


    def _build_tf_idf(self):
        #try to load the encoded corpus from disk
        try:
            self.encoded_corpus = torch.load(self.save_path, map_location=self.device)
            print('Loaded bert encoded corpus from disk')
            return
        except FileNotFoundError:
            pass

        print('encoding corpus with BERT')
        with torch.no_grad():

            # convert each document to a BERT token embedding
            tokenized_corpus = self.tokenizer(self.corpus, return_tensors='pt', padding='max_length', truncation=True)

            # break the data into chunks, and move to GPU
            chunk_size = 20
            tokenized_corpus_chunks = []
            for i in range(0, len(tokenized_corpus['input_ids']), chunk_size):
                tokenized_corpus_chunks.append({k: v[i:i+chunk_size].to(device=self.device) for k, v in tokenized_corpus.items()})

            # encode each document using BERT
            encoded_corpus_chunks = []
            for chunk in tqdm(tokenized_corpus_chunks, desc='encoding corpus with BERT'):
                encoded_corpus_chunks.append(self.model(**chunk).last_hidden_state)

            self.encoded_corpus = torch.cat(encoded_corpus_chunks, dim=0)

            #save the corpus to disk
            torch.save(self.encoded_corpus, self.save_path)

    def embed_query(self, query: str) -> torch.Tensor:
        with torch.no_grad():
            encoded_query = self.tokenizer(query, return_tensors='pt')
            encoded_query = {k: v.to(device=self.device) for k, v in encoded_query.items()}
            encoded_query = self.model(**encoded_query).last_hidden_state[0]
            return encoded_query


    def search(self, query:str, n:Union[int,None]=None) -> list[tuple[T, float]]:
        with torch.no_grad():
            encoded_query = self.embed_query(query) # tokenize and encode with BERT

            # # doing tf-idf all at once takes up waaaay too much memory, lol. But keep for algorithm reference.
            # # cosine_similarity broadcast shape [num_corpus_docs, query_len, max_corpus_doc_len, embedding_size]
            # # result shape: [num_corpus_docs, query_len, max_corpus_doc_len]
            # scores = torch.cosine_similarity(encoded_query[None,:,None], self.encoded_corpus[:,None], dim=3)
            # tf = torch.sum(scores, dim=2)
            # idf = torch.max(scores, dim=2).values.sum(dim=0)

            #chunked version
            tf_list: list[torch.Tensor] = []
            idf = torch.zeros(encoded_query.shape[0], device=self.device)

            #chunk size scales based on the number of tokens in the query
            total_size = prod(self.encoded_corpus.shape) * encoded_query.shape[0]
            chunk_size = max(self.chunk_size * 2**32 // total_size, 1)

            for corpus_chunk in self.encoded_corpus.split(chunk_size):
                scores = torch.cosine_similarity(encoded_query[None,:,None], corpus_chunk[:,None], dim=3)
                idf += scores.max(dim=2).values.sum(dim=0)
                tf_list.append(scores.sum(dim=2))

            # Combine the chunks, and compute the tf-idf scores
            tf = torch.cat(tf_list, dim=0)
            idf = len(self.keys) / idf
            tf_idf = (tf * idf[None,:].log2()).sum(dim=1)

            # collect the documents, sorted by score
            results = [(self.keys[i], tf_idf[i].item()) for i in torch.argsort(tf_idf, descending=True)]

            #clean up memory
            del encoded_query, tf, idf, tf_idf

            # filter for the top n results
            if n is not None:
                results = results[:n]

            return results



class BertSentenceSearch(Search, Generic[T]):
    def __init__(self, corpus: Corpus[T], *, model='all-mpnet-base-v2', save_path='weights', save_name=None, cuda=True, batch_size=32, blacklist: Callable[[str],bool]=lambda x: False):

        with torch.no_grad():
            logging.set_verbosity_error()
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
        self.save_path = join(save_path, f'{save_name}_sentence_embeddings.pt') if save_name is not None else None
        self._build_embeddings()

        #build a list of the indices of the blacklisted documents
        self.blacklist = torch.tensor([i for i, value in enumerate(self.corpus) if blacklist(value)], device=self.device)


    def _build_embeddings(self):
        #try to load the encoded corpus from disk
        if self.save_path is not None:
            try:
                self.embeddings = torch.load(self.save_path, map_location=self.device)
                print('Loaded bert sentence encoded corpus from disk')
                assert self.embeddings.shape[0] == len(self.corpus), f'size mismatch between corpus and embeddings loaded from {self.save_path}'
                return
            except FileNotFoundError:
                pass

        print('encoding corpus with BERT sentence encoder')
        with torch.no_grad():
            self.embeddings = self.model.encode(self.corpus, show_progress_bar=True, device=self.device, convert_to_tensor=True, batch_size=self.batch_size)

            # Save the corpus to disk
            if self.save_path is not None:
                torch.save(self.embeddings, self.save_path)

    def embed_query(self, query: str) -> torch.Tensor:
        with torch.no_grad():
            return self.model.encode(query, show_progress_bar=False, device=self.device, convert_to_tensor=True)

    def search(self, query:str, n:Union[int,None]=None) -> list[tuple[T, float]]:
        with torch.no_grad():
            # embed the query, and compare to all embeddings for documents in the corpus
            encoded_query = self.embed_query(query)
            # scores = torch.cosine_similarity(encoded_query[None,:], self.embeddings, dim=1)
            #batched version
            scores_list: list[torch.Tensor] = []
            for embedding_chunk in self.embeddings.split(self.batch_size):
                scores_list.append(torch.cosine_similarity(encoded_query[None,:], embedding_chunk, dim=1))
            scores = torch.cat(scores_list, dim=0)

            # get the ranked indices of all the documents (filtering out blacklisted ones)
            ranks = torch.argsort(scores, descending=True)
            ranks = ranks[~torch.isin(ranks, self.blacklist)]

            # take the top n results (do this first otherwise very slow)
            if n is not None:
                ranks = ranks[:n]

            # collect the keys and scores for the top results
            results = [(self.keys[i], score) for i, score in zip(ranks, scores[ranks].cpu().numpy())]

            return results

    def __iter__(self):
        """iterate over (key, embedding) pairs"""
        for key, embedding in zip(self.keys, self.embeddings):
            yield key, embedding
