from datetime import datetime, timezone
from uuid import UUID
import time
import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.chat import ChatSession, ChatMessage
from app.models.user import User
from app.schemas.chat import (
    ChatSessionCreate,
    ChatSessionResponse,
    ChatMessageSend,
    ChatAIResponse,
    ChatMessageResponse,
    ActionCard,
    CrisisAlert,
    PaginatedChatSessions,
)
from app.ml.gemini_client import gemini_client
from app.ml.crisis_detector import crisis_detector
from app.ml.sentiment import sentiment_analyzer
from app.ml.embeddings import embedding_service
from app.services.crisis_service import CrisisService
from app.utils.exceptions import NotFoundException, ForbiddenException


class ChatService:
    def __init__(self, db: AsyncSession, current_user: User):
        self.db = db
        self.user = current_user

    async def create_session(self, data: ChatSessionCreate) -> ChatSession:
        session = ChatSession(
            user_id=self.user.id,
            session_type=data.session_type,
            title=self._generate_title(data.session_type),
        )
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)

        # If initial message provided, process it
        if data.initial_message:
            await self.send_message(session.id, ChatMessageSend(content=data.initial_message))
            await self.db.refresh(session)

        return session

    def _generate_title(self, session_type: str) -> str:
        titles = {
            "general": "New Conversation",
            "check_in": "Daily Check-in",
            "guided": "Guided Session",
        }
        return titles.get(session_type, "Chat")

    async def get_session(self, session_id: UUID, include_messages: bool = False) -> ChatSession:
        query = select(ChatSession).where(ChatSession.id == session_id)
        if include_messages:
            query = query.options(selectinload(ChatSession.messages))

        result = await self.db.execute(query)
        session = result.scalar_one_or_none()

        if not session:
            raise NotFoundException("Chat session not found")
        if session.user_id != self.user.id:
            raise ForbiddenException("Not authorized to access this session")

        return session

    async def list_sessions(self, page: int = 1, per_page: int = 20) -> PaginatedChatSessions:
        query = (
            select(ChatSession)
            .where(ChatSession.user_id == self.user.id)
            .order_by(ChatSession.last_message_at.desc().nullsfirst())
        )

        count_result = await self.db.execute(
            select(func.count(ChatSession.id)).where(ChatSession.user_id == self.user.id)
        )
        total = count_result.scalar()

        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)

        result = await self.db.execute(query)
        sessions = result.scalars().all()

        return PaginatedChatSessions(
            items=[ChatSessionResponse.model_validate(s) for s in sessions],
            total=total,
            page=page,
            per_page=per_page,
        )

    async def send_message(self, session_id: UUID, data: ChatMessageSend) -> ChatAIResponse:
        """Process user message and generate AI response."""
        session = await self.get_session(session_id, include_messages=True)
        start_time = time.time()

        # 1. Crisis detection (fast path)
        crisis_result = await crisis_detector.analyze(data.content)

        # 2. Create user message
        user_embedding = await embedding_service.generate(data.content)
        user_msg = ChatMessage(
            session_id=session_id,
            role="user",
            content=data.content,
            crisis_detected=crisis_result.is_crisis,
            embedding=user_embedding,
        )
        self.db.add(user_msg)

        # 3. Handle crisis if detected
        crisis_alert = None
        if crisis_result.is_crisis:
            crisis_service = CrisisService(self.db, self.user)
            await crisis_service.handle_detection(
                source="chat",
                severity=crisis_result.severity,
                confidence=crisis_result.confidence,
            )
            crisis_alert = await crisis_service.build_crisis_alert(crisis_result.severity)

        # 4. Build conversation context
        context_messages = self._build_context(session.messages, data.content)

        # 5. Generate AI response
        ai_response = await gemini_client.chat(
            messages=context_messages,
            is_crisis=crisis_result.is_crisis,
        )

        response_time = int((time.time() - start_time) * 1000)

        # 6. Create assistant message
        assistant_embedding = await embedding_service.generate(ai_response["content"])
        assistant_msg = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=ai_response["content"],
            model_used=ai_response["model"],
            tokens_used=ai_response["tokens_used"],
            response_time_ms=response_time,
            embedding=assistant_embedding,
        )
        self.db.add(assistant_msg)

        # 7. Update session
        session.message_count += 2
        session.last_message_at = datetime.now(timezone.utc)

        await self.db.commit()
        await self.db.refresh(assistant_msg)

        # 8. Build response
        action_cards = self._generate_action_cards(ai_response["content"], crisis_result.is_crisis)

        return ChatAIResponse(
            message=ChatMessageResponse.model_validate(assistant_msg),
            suggestions=ai_response.get("suggestions"),
            action_cards=action_cards,
            crisis_alert=crisis_alert,
        )

    def _build_context(self, messages: list[ChatMessage], new_message: str) -> list[dict]:
        """Build conversation context for AI, limiting to recent messages."""
        # Take last 10 messages for context
        recent = messages[-10:] if len(messages) > 10 else messages

        context = [{"role": msg.role, "content": msg.content} for msg in recent]
        context.append({"role": "user", "content": new_message})

        return context

    def _generate_action_cards(self, content: str, is_crisis: bool) -> list[ActionCard] | None:
        """Generate action cards based on AI response content."""
        cards = []
        content_lower = content.lower()

        if is_crisis:
            cards.append(ActionCard(
                type="resource",
                title="Crisis Support",
                description="Connect with trained crisis counselors",
                action_url="/crisis/resources",
            ))

        if "breath" in content_lower:
            cards.append(ActionCard(
                type="breathing",
                title="Breathing Exercise",
                description="4-7-8 calming breath technique",
                duration_minutes=3,
            ))

        if "ground" in content_lower or "present" in content_lower:
            cards.append(ActionCard(
                type="grounding",
                title="5-4-3-2-1 Grounding",
                description="Reconnect with the present moment",
                duration_minutes=5,
            ))

        return cards[:3] if cards else None

    async def delete_session(self, session_id: UUID) -> None:
        session = await self.get_session(session_id)
        await self.db.delete(session)
        await self.db.commit()
