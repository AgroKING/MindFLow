from datetime import datetime
from uuid import UUID
from sqlalchemy import String, Text, Float, SmallInteger, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class UserInsight(BaseModel):
    __tablename__ = "user_insights"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    insight_type: Mapped[str] = mapped_column(String(30), nullable=False)  # pattern, correlation, trend, milestone
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    # Supporting data
    data_points: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # IDs and dates supporting this insight
    data_visualization: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # Chart config for frontend
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Engagement tracking
    shown_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    dismissed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    helpful_rating: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)  # 1-5

    # Validity period
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    valid_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    recommendations: Mapped[list["Recommendation"]] = relationship(back_populates="insight", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Insight {self.title}>"


# Import at end to avoid circular imports, though not strictly needed here if we use string forward refs, 
# but good for explicit availability if needed.
# from app.models.recommendation import Recommendation 
