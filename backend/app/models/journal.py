from datetime import datetime
from uuid import UUID
from sqlalchemy import String, Integer, Text, Float, LargeBinary, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import BaseModel


class JournalEntry(BaseModel):
    __tablename__ = "journal_entries"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Encrypted content (E2E encrypted on client OR server-side encrypted)
    content_encrypted: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    content_iv: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)  # Initialization vector
    content_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)  # SHA-256 for integrity

    # Metadata (not encrypted, for querying)
    word_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    entry_type: Mapped[str] = mapped_column(String(20), default="freeform")  # freeform, prompted, gratitude, worry_dump
    prompt_id: Mapped[UUID | None] = mapped_column(nullable=True)  # Reference to prompt used

    # Derived analytics (computed from decrypted content, then stored)
    sentiment_score: Mapped[float | None] = mapped_column(Float, nullable=True)  # -1.0 to 1.0
    primary_emotion: Mapped[str | None] = mapped_column(String(30), nullable=True)  # joy, sadness, anxiety, anger, calm
    topics: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # ["work", "family", "health"]

    def __repr__(self):
        return f"<JournalEntry {self.id} type={self.entry_type}>"
