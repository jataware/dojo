from __future__ import annotations

from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Extra, Field


class CreateModel(BaseModel):
    creation_date: Optional[str]
    mod_date: Optional[str]
    type: Optional[str]
    description: Optional[str]
    original_language: Optional[str]
    classification: Optional[str]
    title: Optional[str]
    publisher: Optional[str]
    producer: Optional[str]
    stated_genre: Optional[str]
    uploaded_at: Optional[int]
    source_url: Optional[str]
    filename: Optional[str]


class Model(CreateModel):
    """
    Model for a single Document
    """
    id: str


class DocumentListResponse(BaseModel):
    hits: str
    items_in_page: int
    results: List[Model]
    scroll_id: Optional[str]


class Paragraph(BaseModel):
    class Config:
        extra = Extra.allow

    id: str
    document_id: str
    text: str
    page_no: Optional[int]
    length: Optional[int]

class ParagraphBaseListResponse(BaseModel):
    hits: int = Field(
        ...,
        title="Total count of paragraphs matching request."
    )
    items_in_page: int = Field(
        ...,
        title="Total items within current results page"
    )
    scroll_id: Optional[str] = Field(
        ...,
        title="Scroll ID",
        description= "Used to navigate to the next page of feature results. Will return null when there are no pages left. Similar to cursor-based pagination."
    )

class ParagraphListResponse(ParagraphBaseListResponse):
    results: List[Paragraph]

class DocumentTextResponse(ParagraphBaseListResponse):
  paragraphs: List[Paragraph]

class MetadataOpts(BaseModel):
    match_score: float

class Highlight(BaseModel):
    text: str
    highlight: bool

class SearchParagraph(Paragraph):
    metadata: MetadataOpts
    highlights: Optional[List[Highlight]]

class ParagraphSearchResponse(ParagraphListResponse):
    max_score: int
    results: List[SearchParagraph]
