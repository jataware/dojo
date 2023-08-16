from abc import ABC, abstractmethod
from corpora import Corpus
from typing import Union

class Search(ABC):
    @abstractmethod
    def __init__(self, corpus:Corpus): ...

    @abstractmethod
    def search(self, query:str, n:Union[int,None]=None) -> list[tuple[str, float]]: ...
