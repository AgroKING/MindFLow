from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import CurrentUser
from app.schemas.chat import (
    ChatSessionCreate,
    ChatSessionResponse,
    ChatSessionDetail,
    ChatMessageSend,
    ChatAIResponse,
    ChatMessageResponse,
    PaginatedChatSessions,
)
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_session(
    data: ChatSessionCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Start a new chat session."""
    service = ChatService(db, current_user)
    session = await service.create_session(data)
    return session


@router.get("/sessions", response_model=PaginatedChatSessions)
async def list_chat_sessions(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    """List user's chat sessions."""
    service = ChatService(db, current_user)
    return await service.list_sessions(page, per_page)


@router.get("/sessions/{session_id}", response_model=ChatSessionDetail)
async def get_chat_session(
    session_id: UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Get a chat session with all messages."""
    service = ChatService(db, current_user)
    session = await service.get_session(session_id, include_messages=True)
    return ChatSessionDetail(
        id=session.id,
        title=session.title,
        session_type=session.session_type,
        message_count=session.message_count,
        is_active=session.is_active,
        created_at=session.created_at,
        last_message_at=session.last_message_at,
        messages=[ChatMessageResponse.model_validate(m) for m in session.messages],
    )


@router.post("/sessions/{session_id}/messages", response_model=ChatAIResponse)
async def send_chat_message(
    session_id: UUID,
    data: ChatMessageSend,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Send a message and receive AI response."""
    service = ChatService(db, current_user)
    return await service.send_message(session_id, data)


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat_session(
    session_id: UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Delete a chat session and all its messages."""
    service = ChatService(db, current_user)
    await service.delete_session(session_id)
    return None
