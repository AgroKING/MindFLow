from datetime import datetime
from uuid import UUID
from sqlalchemy import String, Text, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from app.models.base import BaseModel


class ChatSession(BaseModel):
    __tablename__ = "chat_sessions"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str | None] = mapped_column(String(100), nullable=True)
    session_type: Mapped[str] = mapped_column(String(30), default="general")  # general, check_in, guided, crisis
    
    # AI context
    context_summary: Mapped[str | None] = mapped_column(Text, nullable=True)  # Rolling summary
    mood_context: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # Recent mood for personalization

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    message_count: Mapped[int] = mapped_column(Integer, default=0)
    last_message_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="session", 
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at"
    )

    def __repr__(self):
        return f"<ChatSession {self.id} type={self.session_type}>"


class ChatMessage(BaseModel):
    __tablename__ = "chat_messages"

    session_id: Mapped[UUID] = mapped_column(ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)

    role: Mapped[str] = mapped_column(String(10), nullable=False)  # user, assistant
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # AI metadata
    model_used: Mapped[str | None] = mapped_column(String(50), nullable=True)
    tokens_used: Mapped[int | None] = mapped_column(Integer, nullable=True)
    response_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Safety flags
    crisis_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    content_filtered: Mapped[bool] = mapped_column(Boolean, default=False)

    # Vector embedding for semantic search (384 dimensions for MiniLM)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(384), nullable=True)

    # Relationship
    session: Mapped["ChatSession"] = relationship(back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage {self.id} role={self.role}>"
