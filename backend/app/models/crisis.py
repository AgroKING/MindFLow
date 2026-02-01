from datetime import datetime
from uuid import UUID
from sqlalchemy import String, Text, Boolean, Float, SmallInteger, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import BaseModel


class CrisisEvent(BaseModel):
    __tablename__ = "crisis_events"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    trigger_source: Mapped[str] = mapped_column(String(30), nullable=False)  # mood_log, chat, journal, manual
    trigger_content_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    
    severity: Mapped[str] = mapped_column(String(20), nullable=False)  # low, medium, high, critical
    detection_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Response tracking
    resources_shown: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    resource_clicked: Mapped[str | None] = mapped_column(String(50), nullable=True)
    hotline_called: Mapped[bool] = mapped_column(Boolean, default=False)

    # Resolution
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    resolution_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    follow_up_scheduled: Mapped[bool] = mapped_column(Boolean, default=False)

    def __repr__(self):
        return f"<CrisisEvent {self.id} severity={self.severity}>"


class CrisisResource(BaseModel):
    __tablename__ = "crisis_resources"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    resource_type: Mapped[str] = mapped_column(String(30), nullable=False)  # hotline, text_line, website, app

    # Contact info
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    sms_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Availability
    available_24_7: Mapped[bool] = mapped_column(Boolean, default=False)
    available_hours: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Targeting
    countries: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # ["US", "CA"]
    languages: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # ["en", "es"]
    specializations: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # ["suicide", "abuse"]

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    priority: Mapped[int] = mapped_column(SmallInteger, default=5)

    def __repr__(self):
        return f"<CrisisResource {self.name}>"
