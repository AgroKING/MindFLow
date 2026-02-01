from datetime import datetime
from uuid import UUID
from typing import Literal
from pydantic import BaseModel, Field


class JournalEntryCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=50000)
    entry_type: Literal["freeform", "prompted", "gratitude", "worry_dump"] = "freeform"
    prompt_id: UUID | None = None


class JournalEntryUpdate(BaseModel):
    content: str | None = Field(None, min_length=1, max_length=50000)


class JournalEntryResponse(BaseModel):
    id: UUID
    entry_type: str
    word_count: int | None
    sentiment_score: float | None
    primary_emotion: str | None
    topics: list[str] | None  # Changed from dict to list[str] for better consumption if needed, but keeping consistent with Plan which implied List in doc but JSONB in model. Let's assume topics is a list of strings stored in JSONB.
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JournalEntryDetail(JournalEntryResponse):
    content: str  # Decrypted content


class JournalEntriesQuery(BaseModel):
    entry_type: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)


class PaginatedJournalEntries(BaseModel):
    items: list[JournalEntryResponse]
    total: int
    page: int
    per_page: int
    pages: int


class JournalPrompt(BaseModel):
    id: UUID
    category: str
    prompt_text: str
    suitable_for: list[str]  # ["anxious", "sad", "reflective"]
