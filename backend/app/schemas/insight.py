from datetime import datetime
from uuid import UUID
from typing import Literal
from pydantic import BaseModel, Field


class InsightResponse(BaseModel):
    id: UUID
    insight_type: Literal["pattern", "correlation", "trend", "milestone"]
    title: str
    description: str
    confidence_score: float | None
    data_visualization: dict | None
    created_at: datetime
    valid_from: datetime
    valid_until: datetime | None

    class Config:
        from_attributes = True


class InsightFeedback(BaseModel):
    helpful_rating: int = Field(..., ge=1, le=5)
    feedback_text: str | None = None


class PaginatedInsights(BaseModel):
    items: list[InsightResponse]
    total: int
    page: int
    per_page: int
