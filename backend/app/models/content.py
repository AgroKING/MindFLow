from sqlalchemy import String, Text, SmallInteger, Boolean, Float, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import BaseModel


class ContentLibrary(BaseModel):
    __tablename__ = "content_library"

    content_type: Mapped[str] = mapped_column(String(30), nullable=False)  # breathing, meditation, grounding, tip, article
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Content body
    content_body: Mapped[str | None] = mapped_column(Text, nullable=True)  # Markdown or structured content
    duration_minutes: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    difficulty: Mapped[str | None] = mapped_column(String(20), nullable=True)  # beginner, intermediate, advanced

    # Instructions for exercises
    instructions: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # Ordered list of steps

    # Targeting
    target_moods: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # ["anxious", "sad", "stressed"]
    target_factors: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # ["sleep", "work"]

    # Media
    audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Metadata
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    avg_rating: Mapped[float | None] = mapped_column(Float, nullable=True)

    def __repr__(self):
        return f"<Content {self.title}>"
