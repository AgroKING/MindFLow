from datetime import datetime
from uuid import UUID
from typing import Literal
from pydantic import BaseModel, Field
from app.schemas.content import ContentBrief


class RecommendationResponse(BaseModel):
    id: UUID
    content: ContentBrief
    reason: str | None
    priority: int
    expires_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class RecommendationFeedback(BaseModel):
    feedback: Literal["helpful", "not_helpful", "skip"]


class PaginatedRecommendations(BaseModel):
    items: list[RecommendationResponse]
    total: int
    page: int
    per_page: int
