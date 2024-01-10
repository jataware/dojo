from pydantic import BaseModel
from typing import Optional


class Citation(BaseModel):
    name: str
    indexes: list[int]


class Document(BaseModel):
    text: str
    document_id: str
    paragraph_id: str


class CausesResponse(BaseModel):
    grounded: bool
    causes: list[str]
    citations: list[Citation]
    documents: list[Document]


class EffectsResponse(BaseModel):
    grounded: bool
    effects: list[str]
    citations: list[Citation]
    documents: list[Document]


class NestedLinks(BaseModel):
    grounded: bool
    citations: list[Citation]
    errors: Optional[str]


class Metadata(BaseModel):
    causes: NestedLinks
    effects: NestedLinks


class RecommenderFullResponse(BaseModel):
    causes: list[str]
    effects: list[str]
    metadata: Metadata
    documents: list[Document]
