from __future__ import annotations

from typing import List, Optional, Any, Dict
# from xmlrpc.client import Boolean
from pydantic import BaseModel, Extra, Field
# from doctest import Example


class Model(BaseModel):
    """
    Model for a single Document
    """

    class Config:
        extra = Extra.allow

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


class DocumentListResponse(BaseModel):
    hits: str
    items_in_page: int
    results: List[Model]
    scroll_id: Optional[str]


class Paragraph(BaseModel):

    class Config:
        extra = Extra.allow

    id: str = Field(
        ...,
        description="A unique paragraph id. Concatenation of parent document and paragraph index",
        examples=["123e4567-e89b-12d3-a456-426614174000-1"],
        title="Paragraph ID"
    )
    document_id = str

    text: str = Field(
        ...,
        description="Full paragraph text. Paragraphs are identified by a newline. May consist of headings, labels, sentences, or paragraph text",
        examples=["Figure 1", "Aenean in sem ac leo mollis blandit.", "Nullam eu ante vel est convallis dignissim.  Fusce suscipit, wisi nec facilisis facilisis, est dui fermentum leo, quis tempor ligula erat quis odio.  Nunc porta vulputate tellus.  Nunc rutrum turpis sed pede.  Sed bibendum.  Aliquam posuere.  Nunc aliquet, augue nec adipiscing interdum, lacus tellus malesuada massa, quis varius mi purus non odio.  Pellentesque condimentum, magna ut suscipit hendrerit, ipsum augue ornare nulla, non luctus diam neque sit amet urna.  Curabitur vulputate vestibulum lorem.  Fusce sagittis, libero non molestie mollis, magna orci ultrices dolor, at vulputate neque nulla lacinia eros.  Sed id ligula quis est convallis tempor. Curabitur lacinia pulvinar nibh."],
        title="Full paragraph text"
    )

    # TODO These are optional but were missing...
    # Try adding them back and re-testing.

    # length: Optional[int] = Field(
    #     ...,
    #     title="Length of text string property."
    # )

    # page_no: Optional[int] = Field(
    #     ...,
    #     description="Page number of source document where the paragraph was found."
    # )


class ParagraphListResponse(BaseModel):
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
    results: List[Paragraph]


class ParagraphSearchResponse(ParagraphListResponse):
    max_score: int
