# simple place to collect all the corpora available to search over
from abc import ABC, abstractmethod
from typing import TypeVar, Generic, Iterator, Iterable, Callable, Dict, Tuple, List

T = TypeVar('T')
class Corpus(Generic[T]):
    def __init__(self, docs: Dict[T, str]):
        assert isinstance(docs, dict), "corpus must be a Dict[T, str]"
        assert all(isinstance(doc, str) for doc in docs.values()), 'corpus may only contain strings'
        self.keyed_corpus = docs

    def get_keyed_corpus(self) -> Dict[T, str]:
        return self.keyed_corpus

    def __getitem__(self, key: T) -> str:
        return self.keyed_corpus[key]

    def __len__(self) -> int:
        return len(self.keyed_corpus)

    def __iter__(self) -> Iterator[T]:
        return iter(self.keyed_corpus)

    def keys(self) -> Iterable[T]:
        return self.keyed_corpus.keys()

    def values(self) -> Iterable[str]:
        return self.keyed_corpus.values()

    def items(self) -> Iterable[Tuple[T, str]]:
        return self.keyed_corpus.items()

    @staticmethod
    def from_list(docs: List[str]) -> 'Corpus[int]':
        return Corpus({i: doc for i, doc in enumerate(docs)})

    @staticmethod
    def from_dict(docs: Dict[T, str]) -> 'Corpus[T]':
        return Corpus(docs)

    @staticmethod
    def chunk(corpus: 'Corpus[T]', chunker: Callable[[str], List[str]]) -> 'Corpus[Tuple[T, int]]':
        """chunk a corpus into smaller documents"""
        new_docs = {}
        for key, doc in corpus.items():
            chunks = chunker(doc)
            for i, chunk in enumerate(chunks):
                new_docs[(key, i)] = chunk
        return Corpus(new_docs)


#TODO: instead of any, tuple version should take a key type (i.e. hashable)
class CorpusLoader(ABC):
    @staticmethod
    @abstractmethod
    def get_corpus() -> Corpus: ...
    #TODO: maybe some way to validate documents should be less than 512 tokens...
