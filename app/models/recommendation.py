from datetime import datetime
from uuid import UUID
from sqlalchemy import String, SmallInteger, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class Recommendation(BaseModel):
    __tablename__ = "recommendations"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    insight_id: Mapped[UUID | None] = mapped_column(ForeignKey("user_insights.id", ondelete="SET NULL"), nullable=True)
    content_id: Mapped[UUID] = mapped_column(ForeignKey("content_library.id", ondelete="CASCADE"), nullable=False)

    reason: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Why this was recommended
    priority: Mapped[int] = mapped_column(SmallInteger, default=5)  # 1-10

    # Engagement tracking
    shown_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    clicked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    feedback: Mapped[str | None] = mapped_column(String(20), nullable=True)  # helpful, not_helpful, skip

    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    insight: Mapped["UserInsight | None"] = relationship(back_populates="recommendations")
    content: Mapped["ContentLibrary"] = relationship()

    def __repr__(self):
        return f"<Recommendation {self.id}>"


from app.models.insight import UserInsight  # noqa: E402
from app.models.content import ContentLibrary  # noqa: E402
