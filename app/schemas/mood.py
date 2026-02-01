from datetime import datetime, date
from uuid import UUID
from typing import Literal
from pydantic import BaseModel, Field


class MoodFactorInput(BaseModel):
    factor_type: Literal["sleep", "exercise", "social", "work", "weather", "health"]
    factor_value: str | None = None
    impact_score: int | None = Field(None, ge=-5, le=5)


class MoodFactorResponse(BaseModel):
    id: UUID
    factor_type: str
    factor_value: str | None
    impact_score: int | None

    class Config:
        from_attributes = True


class MoodLogCreate(BaseModel):
    mood_score: int = Field(..., ge=1, le=10)
    energy_level: int | None = Field(None, ge=1, le=10)
    anxiety_level: int | None = Field(None, ge=1, le=10)
    note: str | None = Field(None, max_length=500)
    factors: list[MoodFactorInput] | None = None
    location_type: Literal["home", "work", "outdoors", "transit"] | None = None
    logged_at: datetime | None = None  # Defaults to now


class MoodLogUpdate(BaseModel):
    mood_score: int | None = Field(None, ge=1, le=10)
    energy_level: int | None = Field(None, ge=1, le=10)
    anxiety_level: int | None = Field(None, ge=1, le=10)
    note: str | None = Field(None, max_length=500)


class MoodLogResponse(BaseModel):
    id: UUID
    mood_score: int
    energy_level: int | None
    anxiety_level: int | None
    note: str | None
    note_sentiment: float | None
    factors: list[MoodFactorResponse]
    logged_at: datetime
    time_of_day: str | None
    location_type: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class MoodLogsQuery(BaseModel):
    start_date: date | None = None
    end_date: date | None = None
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)


class PaginatedMoodLogs(BaseModel):
    items: list[MoodLogResponse]
    total: int
    page: int
    per_page: int
    pages: int


class MoodStatsResponse(BaseModel):
    period: str  # "7d", "30d", "90d"
    avg_mood: float
    avg_energy: float | None
    avg_anxiety: float | None
    mood_trend: Literal["improving", "stable", "declining"]
    best_day: str | None  # Day of week
    worst_day: str | None
    total_logs: int
    streak_days: int  # Consecutive days with logs


class MoodTrendPoint(BaseModel):
    date: date
    avg_mood: float
    log_count: int


class MoodTrendsResponse(BaseModel):
    period: str
    data_points: list[MoodTrendPoint]
    overall_trend: float  # Slope of trend line
