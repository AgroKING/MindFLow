from datetime import datetime
from uuid import UUID
from typing import Literal
from pydantic import BaseModel, Field


class ChatSessionCreate(BaseModel):
    session_type: Literal["general", "check_in", "guided"] = "general"
    initial_message: str | None = None


class ChatSessionResponse(BaseModel):
    id: UUID
    title: str | None
    session_type: str
    message_count: int
    is_active: bool
    created_at: datetime
    last_message_at: datetime | None

    class Config:
        from_attributes = True


class ChatMessageSend(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)


class ChatMessageResponse(BaseModel):
    id: UUID
    role: Literal["user", "assistant"]
    content: str
    crisis_detected: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ActionCard(BaseModel):
    type: Literal["breathing", "grounding", "resource", "insight"]
    title: str
    description: str
    action_url: str | None = None
    duration_minutes: int | None = None


class CrisisAlert(BaseModel):
    severity: Literal["low", "medium", "high", "critical"]
    message: str
    resources: list["CrisisResourceBrief"]
    show_self_harm_check: bool = False


class CrisisResourceBrief(BaseModel):
    id: UUID
    name: str
    phone_number: str | None
    resource_type: str


class ChatAIResponse(BaseModel):
    message: ChatMessageResponse
    suggestions: list[str] | None = None
    action_cards: list[ActionCard] | None = None
    crisis_alert: CrisisAlert | None = None


class ChatSessionDetail(ChatSessionResponse):
    messages: list[ChatMessageResponse]


class PaginatedChatSessions(BaseModel):
    items: list[ChatSessionResponse]
    total: int
    page: int
    per_page: int
