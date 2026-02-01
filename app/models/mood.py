from datetime import datetime
from uuid import UUID
from sqlalchemy import String, SmallInteger, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class MoodLog(BaseModel):
    __tablename__ = "mood_logs"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Core mood data
    mood_score: Mapped[int] = mapped_column(SmallInteger, nullable=False)  # 1-10
    energy_level: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)  # 1-10
    anxiety_level: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)  # 1-10

    # Optional context
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    note_sentiment: Mapped[float | None] = mapped_column(Float, nullable=True)  # -1.0 to 1.0

    # Temporal context
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    time_of_day: Mapped[str | None] = mapped_column(String(20), nullable=True)  # morning, afternoon, evening, night
    day_of_week: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)  # 0-6

    # Location context
    location_type: Mapped[str | None] = mapped_column(String(30), nullable=True)  # home, work, outdoors, transit

    # Processing flags
    processed_for_insights: Mapped[bool] = mapped_column(Boolean, default=False)
    crisis_flag_triggered: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    factors: Mapped[list["MoodFactor"]] = relationship(back_populates="mood_log", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<MoodLog {self.id} score={self.mood_score}>"


class MoodFactor(BaseModel):
    __tablename__ = "mood_factors"

    mood_log_id: Mapped[UUID] = mapped_column(ForeignKey("mood_logs.id", ondelete="CASCADE"), nullable=False)

    factor_type: Mapped[str] = mapped_column(String(30), nullable=False)  # sleep, exercise, social, work, weather, health
    factor_value: Mapped[str | None] = mapped_column(String(50), nullable=True)  # poor, good, stressful, etc.
    impact_score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)  # -5 to 5

    mood_log: Mapped["MoodLog"] = relationship(back_populates="factors")
