from abc import ABC, abstractmethod
from src.datasearch.corpora import Corpus
from typing import Union, Tuple, List

class Search(ABC):
    @abstractmethod
    def __init__(self, corpus:Corpus): ...

    @abstractmethod
    def search(self, query:str, n:Union[int,None]=None) -> List[Tuple[str, float]]: ...
