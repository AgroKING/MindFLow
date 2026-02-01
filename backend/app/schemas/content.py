from datetime import datetime
from uuid import UUID
from typing import Literal
from pydantic import BaseModel, Field


class ContentBrief(BaseModel):
    id: UUID
    content_type: str
    title: str
    description: str | None
    duration_minutes: int | None
    image_url: str | None
    is_premium: bool

    class Config:
        from_attributes = True


class ContentDetail(ContentBrief):
    content_body: str | None
    difficulty: str | None
    instructions: list[dict] | None
    audio_url: str | None
    target_moods: list[dict] | None
    avg_rating: float | None
    view_count: int


class ContentQuery(BaseModel):
    content_type: Literal["breathing", "meditation", "grounding", "tip", "article"] | None = None
    mood: str | None = None  # Filter by target mood
    difficulty: str | None = None
    is_premium: bool | None = None
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)


class PaginatedContent(BaseModel):
    items: list[ContentBrief]
    total: int
    page: int
    per_page: int


class ContentRating(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    feedback: str | None = None
