# from __future__ import annotations
from abc import ABC, abstractmethod
from datasearch.corpora import Corpus
from typing import Dict, Tuple, List, Union

class Search(ABC):
    @abstractmethod
    def __init__(self, corpus:Corpus): ...

    @abstractmethod
    def search(self, query:str, n:Union[int,None]=None) -> List[Tuple[str, float]]: ...
