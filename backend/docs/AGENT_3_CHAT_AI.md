# Agent 3: Chat System & AI Integration

## Your Role
You are responsible for the **conversational AI chat system**, **Gemini 2.5 integration**, **sentiment analysis**, and **crisis detection**. You build on Agent 1's foundation and work in parallel with Agents 2 and 4.

---

## Dependencies
- **Wait for Agent 1** to complete: database, auth, base models
- You can work in parallel with Agent 2 and 4 after Agent 1 is done
- Agent 2's mood/journal models will call your sentiment service (provide interface)

---

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| LLM | Google Gemini 2.5 | Latest |
| SDK | google-genai | 1.0+ |
| Embeddings | pgvector | 0.3+ |
| Sentiment | transformers | 4.47+ |
| All others | See Agent 1 | Same |

---

## Files You Own (CREATE THESE)

```
d:\newApp\app\
├── models/
│   ├── chat.py                      # ChatSession, ChatMessage
│   └── crisis.py                    # CrisisEvent, CrisisResource
│
├── schemas/
│   ├── chat.py                      # Chat request/response schemas
│   └── crisis.py                    # Crisis schemas
│
├── services/
│   ├── chat_service.py              # Chat logic + AI responses
│   └── crisis_service.py            # Crisis detection & resources
│
├── ml/
│   ├── __init__.py
│   ├── gemini_client.py             # Gemini 2.5 API wrapper
│   ├── sentiment.py                 # Sentiment analysis
│   ├── crisis_detector.py           # Crisis keyword/intent detection
│   └── embeddings.py                # Text embeddings for vector search
│
├── api/v1/
│   ├── chat.py                      # Chat endpoints
│   └── crisis.py                    # Crisis endpoints

tests/
├── test_chat.py
└── test_crisis.py

alembic/versions/
└── 003_chat_crisis_tables.py
```

---

## Detailed Implementation

### 1. Add to `requirements.txt`

```txt
# Add these (Agent 1 has the base)
google-genai==1.0.0
transformers==4.47.1
torch==2.5.1
numpy==2.2.2
pgvector==0.3.6
```

### 2. `app/ml/gemini_client.py`

```python
import google.genai as genai
from google.genai import types
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Mental health guardrails for system prompts
MENTAL_HEALTH_SYSTEM_PROMPT = """You are MindFlow, a caring and empathetic mental wellness companion.

CORE PRINCIPLES:
1. Always respond with empathy and understanding
2. NEVER diagnose mental health conditions - you are not a clinician
3. NEVER provide medication advice
4. If someone expresses thoughts of self-harm or suicide, immediately provide crisis resources
5. Encourage professional help when appropriate
6. Focus on evidence-based wellness techniques (breathing, grounding, mindfulness)
7. Be warm, supportive, and non-judgmental
8. Keep responses concise but caring

RESPONSE STYLE:
- Acknowledge feelings before offering suggestions
- Ask open-ended questions to understand better
- Offer actionable wellness techniques when appropriate
- Use a warm, conversational tone

SAFETY BOUNDARIES:
- If crisis indicators detected, prioritize safety resources over conversation
- Never encourage isolation or harmful behaviors
- Always validate the person's worth and importance
"""

CRISIS_ESCALATION_PROMPT = """IMPORTANT: The user may be in crisis. 
- Respond with immediate empathy and validation
- Gently offer crisis resources (988 Suicide & Crisis Lifeline in US)
- Ask if they are safe without being pushy
- DO NOT try to fix or minimize their feelings
- Prioritize connection and safety over advice"""


class GeminiClient:
    def __init__(self):
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.model = "gemini-2.5-flash"  # or "gemini-2.5-pro" for better quality

    async def chat(
        self,
        messages: list[dict],
        system_prompt: str | None = None,
        is_crisis: bool = False,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> dict:
        """
        Send chat messages to Gemini and get response.
        
        Args:
            messages: List of {"role": "user"|"assistant", "content": str}
            system_prompt: Optional custom system prompt
            is_crisis: If True, adds crisis escalation instructions
            temperature: Response randomness (0-1)
            max_tokens: Maximum response length
            
        Returns:
            {
                "content": str,
                "tokens_used": int,
                "model": str,
                "suggestions": list[str] | None
            }
        """
        try:
            # Build system instruction
            system = system_prompt or MENTAL_HEALTH_SYSTEM_PROMPT
            if is_crisis:
                system += "\n\n" + CRISIS_ESCALATION_PROMPT

            # Convert to Gemini format
            gemini_messages = []
            for msg in messages:
                role = "user" if msg["role"] == "user" else "model"
                gemini_messages.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=msg["content"])]
                    )
                )

            # Create generation config
            config = types.GenerateContentConfig(
                system_instruction=system,
                temperature=temperature,
                max_output_tokens=max_tokens,
                safety_settings=[
                    types.SafetySetting(
                        category="HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold="BLOCK_ONLY_HIGH"
                    ),
                    types.SafetySetting(
                        category="HARM_CATEGORY_HARASSMENT",
                        threshold="BLOCK_ONLY_HIGH"
                    ),
                ]
            )

            # Generate response
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=gemini_messages,
                config=config,
            )

            content = response.text
            tokens = response.usage_metadata.total_token_count if response.usage_metadata else 0

            # Extract suggested quick replies (if we can parse them from response)
            suggestions = self._extract_suggestions(content)

            return {
                "content": content,
                "tokens_used": tokens,
                "model": self.model,
                "suggestions": suggestions,
            }

        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return {
                "content": self._fallback_response(is_crisis),
                "tokens_used": 0,
                "model": "fallback",
                "suggestions": None,
            }

    def _extract_suggestions(self, content: str) -> list[str] | None:
        """Extract any suggested quick replies from AI response."""
        # Simple heuristic - could be enhanced
        suggestions = []
        if "breathing" in content.lower():
            suggestions.append("Try breathing exercise")
        if "talk" in content.lower() or "feel" in content.lower():
            suggestions.append("Tell me more")
        if not suggestions:
            suggestions = ["I understand", "Continue"]
        return suggestions[:3]

    def _fallback_response(self, is_crisis: bool) -> str:
        if is_crisis:
            return (
                "I'm here for you. If you're in crisis, please reach out to "
                "the 988 Suicide & Crisis Lifeline by calling or texting 988. "
                "You matter, and help is available."
            )
        return (
            "I'm here to support you. Could you tell me a bit more about "
            "how you're feeling right now?"
        )


# Singleton instance
gemini_client = GeminiClient()
```

### 3. `app/ml/sentiment.py`

```python
from transformers import pipeline
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)


class SentimentAnalyzer:
    def __init__(self):
        self._model = None

    @property
    def model(self):
        if self._model is None:
            logger.info("Loading sentiment model...")
            self._model = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                device=-1,  # CPU, use 0 for GPU
            )
        return self._model

    async def analyze(self, text: str) -> dict:
        """
        Analyze sentiment of text.
        
        Returns:
            {
                "score": float,  # -1.0 to 1.0
                "label": str,    # "positive", "negative", "neutral"
                "confidence": float
            }
        """
        if not text or len(text.strip()) < 3:
            return {"score": 0.0, "label": "neutral", "confidence": 0.0}

        try:
            # Truncate for model limits
            truncated = text[:512]
            result = self.model(truncated)[0]

            # Map labels to scores
            label = result["label"].lower()
            confidence = result["score"]

            if label == "positive":
                score = confidence
            elif label == "negative":
                score = -confidence
            else:
                score = 0.0

            return {
                "score": round(score, 4),
                "label": label,
                "confidence": round(confidence, 4),
            }

        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return {"score": 0.0, "label": "neutral", "confidence": 0.0}

    async def detect_emotion(self, text: str) -> str | None:
        """Detect primary emotion from text."""
        # Simple keyword-based for now - can enhance with emotion model
        text_lower = text.lower()
        
        emotion_keywords = {
            "joy": ["happy", "excited", "grateful", "wonderful", "amazing", "great"],
            "sadness": ["sad", "depressed", "lonely", "hopeless", "empty", "crying"],
            "anxiety": ["anxious", "worried", "nervous", "panic", "scared", "fear"],
            "anger": ["angry", "frustrated", "annoyed", "furious", "irritated"],
            "calm": ["peaceful", "relaxed", "calm", "content", "serene"],
        }

        scores = {}
        for emotion, keywords in emotion_keywords.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            if score > 0:
                scores[emotion] = score

        if scores:
            return max(scores, key=scores.get)
        return None


# Singleton
sentiment_analyzer = SentimentAnalyzer()
```

### 4. `app/ml/crisis_detector.py`

```python
import re
from dataclasses import dataclass
from typing import Literal
import logging

logger = logging.getLogger(__name__)


@dataclass
class CrisisResult:
    is_crisis: bool
    severity: Literal["none", "low", "medium", "high", "critical"]
    indicators: list[str]
    confidence: float


class CrisisDetector:
    """
    Detects crisis indicators in text using keyword matching and patterns.
    This is a safety-critical component - err on the side of caution.
    """

    # High-priority patterns (immediate concern)
    CRITICAL_PATTERNS = [
        r"\b(kill|end|take)\s+(myself|my life|it all)\b",
        r"\bsuicid(e|al)\b",
        r"\bdon'?t\s+want\s+to\s+(live|be here|exist)\b",
        r"\b(want|going)\s+to\s+die\b",
        r"\bending\s+(it|my life|everything)\b",
        r"\bno\s+reason\s+to\s+live\b",
    ]

    # Medium-priority patterns (significant concern)
    HIGH_PATTERNS = [
        r"\bself[- ]?harm\b",
        r"\bhurt(ing)?\s+myself\b",
        r"\bcut(ting)?\s+myself\b",
        r"\bworthless\b",
        r"\beveryone.*better.*without\s+me\b",
        r"\bgive\s+up\b",
        r"\bno\s+hope\b",
    ]

    # Lower-priority patterns (worth monitoring)
    MEDIUM_PATTERNS = [
        r"\bhopeless\b",
        r"\bdesperate\b",
        r"\bcan'?t\s+(go on|take it|cope)\b",
        r"\btrapped\b",
        r"\bburdren\b",
        r"\bexhausted\b.*(living|life)\b",
    ]

    def __init__(self):
        self.critical_re = [re.compile(p, re.IGNORECASE) for p in self.CRITICAL_PATTERNS]
        self.high_re = [re.compile(p, re.IGNORECASE) for p in self.HIGH_PATTERNS]
        self.medium_re = [re.compile(p, re.IGNORECASE) for p in self.MEDIUM_PATTERNS]

    async def analyze(self, text: str) -> CrisisResult:
        """
        Analyze text for crisis indicators.
        
        Returns CrisisResult with severity level and matched indicators.
        """
        if not text:
            return CrisisResult(is_crisis=False, severity="none", indicators=[], confidence=0.0)

        indicators = []
        severity_scores = {"critical": 0, "high": 0, "medium": 0}

        # Check critical patterns
        for pattern in self.critical_re:
            if pattern.search(text):
                indicators.append(f"critical: {pattern.pattern}")
                severity_scores["critical"] += 1

        # Check high patterns
        for pattern in self.high_re:
            if pattern.search(text):
                indicators.append(f"high: {pattern.pattern}")
                severity_scores["high"] += 1

        # Check medium patterns
        for pattern in self.medium_re:
            if pattern.search(text):
                indicators.append(f"medium: {pattern.pattern}")
                severity_scores["medium"] += 1

        # Determine overall severity
        if severity_scores["critical"] > 0:
            severity = "critical"
            confidence = 0.95
        elif severity_scores["high"] > 0:
            severity = "high"
            confidence = 0.85
        elif severity_scores["medium"] >= 2:
            severity = "medium"
            confidence = 0.7
        elif severity_scores["medium"] == 1:
            severity = "low"
            confidence = 0.5
        else:
            severity = "none"
            confidence = 0.9

        is_crisis = severity in ["medium", "high", "critical"]

        if indicators:
            logger.warning(f"Crisis indicators detected: severity={severity}, count={len(indicators)}")

        return CrisisResult(
            is_crisis=is_crisis,
            severity=severity,
            indicators=indicators,
            confidence=confidence,
        )


# Singleton
crisis_detector = CrisisDetector()
```

### 5. `app/ml/embeddings.py`

```python
from sentence_transformers import SentenceTransformer
from functools import lru_cache
import numpy as np
import logging

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Generate text embeddings for semantic search."""

    def __init__(self):
        self._model = None
        self.dimension = 384  # all-MiniLM-L6-v2 output dimension

    @property
    def model(self):
        if self._model is None:
            logger.info("Loading embedding model...")
            self._model = SentenceTransformer("all-MiniLM-L6-v2")
        return self._model

    async def generate(self, text: str) -> list[float]:
        """Generate embedding vector for text."""
        if not text:
            return [0.0] * self.dimension

        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Embedding generation error: {e}")
            return [0.0] * self.dimension

    async def generate_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts."""
        if not texts:
            return []

        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Batch embedding error: {e}")
            return [[0.0] * self.dimension for _ in texts]


# Singleton
embedding_service = EmbeddingService()
```

### 6. `app/models/chat.py`

```python
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
```

### 7. `app/models/crisis.py`

```python
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
```

### 8. `app/schemas/chat.py`

```python
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
```

### 9. `app/schemas/crisis.py`

```python
from datetime import datetime
from uuid import UUID
from typing import Literal
from pydantic import BaseModel, Field


class CrisisResource(BaseModel):
    id: UUID
    name: str
    description: str | None
    resource_type: Literal["hotline", "text_line", "website", "app"]
    phone_number: str | None
    sms_number: str | None
    website_url: str | None
    available_24_7: bool

    class Config:
        from_attributes = True


class CrisisSelfCheck(BaseModel):
    feeling_hopeless: bool = False
    thoughts_of_self_harm: bool = False
    thoughts_of_suicide: bool = False
    feeling_trapped: bool = False
    increased_substance_use: bool = False


class CrisisCheckResponse(BaseModel):
    risk_level: Literal["low", "medium", "high", "critical"]
    message: str
    resources: list[CrisisResource]
    professional_referral_suggested: bool


class SafetyContact(BaseModel):
    name: str
    relationship: str
    phone: str | None = None
    can_call_anytime: bool = False


class SafetyPlan(BaseModel):
    warning_signs: list[str] = Field(default_factory=list)
    coping_strategies: list[str] = Field(default_factory=list)
    social_contacts: list[SafetyContact] = Field(default_factory=list)
    professional_contacts: list[SafetyContact] = Field(default_factory=list)
    environment_safety_steps: list[str] = Field(default_factory=list)
    reasons_for_living: list[str] = Field(default_factory=list)


class SafetyPlanUpdate(BaseModel):
    warning_signs: list[str] | None = None
    coping_strategies: list[str] | None = None
    social_contacts: list[SafetyContact] | None = None
    professional_contacts: list[SafetyContact] | None = None
    environment_safety_steps: list[str] | None = None
    reasons_for_living: list[str] | None = None
```

### 10. `app/services/chat_service.py`

```python
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
    ChatSessionDetail,
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
            event = await crisis_service.handle_detection(
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
```

### 11. `app/services/crisis_service.py`

```python
from datetime import datetime, timezone
from uuid import UUID
import hashlib
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.crisis import CrisisEvent, CrisisResource
from app.models.user import User
from app.schemas.chat import CrisisAlert, CrisisResourceBrief
from app.schemas.crisis import SafetyPlan, SafetyPlanUpdate
import logging

logger = logging.getLogger(__name__)


class CrisisService:
    def __init__(self, db: AsyncSession, current_user: User):
        self.db = db
        self.user = current_user

    async def handle_detection(
        self,
        source: str,
        severity: str,
        confidence: float = 0.0,
        content_hash: str | None = None,
    ) -> CrisisEvent:
        """Log a crisis detection event."""
        event = CrisisEvent(
            user_id=self.user.id,
            trigger_source=source,
            trigger_content_hash=content_hash,
            severity=severity,
            detection_confidence=confidence,
        )
        self.db.add(event)
        await self.db.commit()
        await self.db.refresh(event)

        logger.warning(
            f"Crisis detected: user={self.user.id}, severity={severity}, source={source}"
        )

        return event

    async def get_resources(self, country: str = "US", language: str = "en") -> list[CrisisResource]:
        """Get relevant crisis resources."""
        query = (
            select(CrisisResource)
            .where(CrisisResource.is_active == True)
            .order_by(CrisisResource.priority.desc())
        )

        result = await self.db.execute(query)
        resources = result.scalars().all()

        # Filter by country/language if specified
        filtered = []
        for r in resources:
            countries = r.countries or ["US"]
            languages = r.languages or ["en"]
            if country in countries or "ALL" in countries:
                if language in languages or "ALL" in languages:
                    filtered.append(r)

        return filtered[:10]

    async def build_crisis_alert(self, severity: str) -> CrisisAlert:
        """Build crisis alert with resources."""
        resources = await self.get_resources()

        messages = {
            "low": "I noticed some concerning language. Would you like to talk about what's going on?",
            "medium": "I'm concerned about what you shared. You don't have to go through this alone.",
            "high": "I hear you, and I'm worried about you. Let's connect you with support.",
            "critical": "Your safety matters. Please reach out to one of these resources right now.",
        }

        return CrisisAlert(
            severity=severity,
            message=messages.get(severity, messages["medium"]),
            resources=[
                CrisisResourceBrief(
                    id=r.id,
                    name=r.name,
                    phone_number=r.phone_number,
                    resource_type=r.resource_type,
                )
                for r in resources[:5]
            ],
            show_self_harm_check=severity in ["high", "critical"],
        )

    async def log_resource_click(self, event_id: UUID, resource_id: str) -> None:
        """Log when user clicks a crisis resource."""
        result = await self.db.execute(
            select(CrisisEvent).where(
                CrisisEvent.id == event_id,
                CrisisEvent.user_id == self.user.id,
            )
        )
        event = result.scalar_one_or_none()

        if event:
            event.resource_clicked = resource_id
            await self.db.commit()

    async def resolve_event(self, event_id: UUID, resolution_type: str) -> None:
        """Mark a crisis event as resolved."""
        result = await self.db.execute(
            select(CrisisEvent).where(
                CrisisEvent.id == event_id,
                CrisisEvent.user_id == self.user.id,
            )
        )
        event = result.scalar_one_or_none()

        if event:
            event.resolved_at = datetime.now(timezone.utc)
            event.resolution_type = resolution_type
            await self.db.commit()
```

### 12. `app/api/v1/chat.py`

```python
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
```

### 13. `app/api/v1/crisis.py`

```python
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import CurrentUser
from app.schemas.crisis import (
    CrisisResource,
    CrisisSelfCheck,
    CrisisCheckResponse,
    SafetyPlan,
    SafetyPlanUpdate,
)
from app.services.crisis_service import CrisisService

router = APIRouter(prefix="/crisis", tags=["Crisis Support"])


@router.get("/resources", response_model=list[CrisisResource])
async def get_crisis_resources(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    country: str = "US",
    language: str = "en",
):
    """Get crisis support resources."""
    service = CrisisService(db, current_user)
    resources = await service.get_resources(country, language)
    return resources


@router.post("/check", response_model=CrisisCheckResponse)
async def crisis_self_check(
    data: CrisisSelfCheck,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Manual crisis self-assessment."""
    service = CrisisService(db, current_user)

    # Calculate risk level based on responses
    critical_flags = [data.thoughts_of_suicide, data.thoughts_of_self_harm]
    high_flags = [data.feeling_hopeless, data.feeling_trapped]

    if any(critical_flags):
        risk_level = "critical"
        message = "Your safety is the priority right now. Please reach out to a crisis counselor."
    elif all(high_flags):
        risk_level = "high"
        message = "It sounds like you're going through a really difficult time. Support is available."
    elif any(high_flags) or data.increased_substance_use:
        risk_level = "medium"
        message = "Thank you for sharing. Consider talking to someone about how you're feeling."
    else:
        risk_level = "low"
        message = "It's good that you checked in. Remember, support is always available if you need it."

    # Log the check
    await service.handle_detection(
        source="manual",
        severity=risk_level,
        confidence=1.0,
    )

    resources = await service.get_resources()

    return CrisisCheckResponse(
        risk_level=risk_level,
        message=message,
        resources=resources[:5],
        professional_referral_suggested=risk_level in ["high", "critical"],
    )


@router.post("/events/{event_id}/resource-clicked", status_code=status.HTTP_204_NO_CONTENT)
async def log_resource_click(
    event_id: UUID,
    resource_id: str,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Log when user clicks a crisis resource."""
    service = CrisisService(db, current_user)
    await service.log_resource_click(event_id, resource_id)
    return None
```

### 14. Update `app/api/v1/router.py`

```python
from app.api.v1 import auth, mood, journal, chat, crisis

api_router = APIRouter()

api_router.include_router(auth.router)        # Agent 1
api_router.include_router(mood.router)        # Agent 2
api_router.include_router(journal.router)     # Agent 2
api_router.include_router(chat.router)        # Agent 3
api_router.include_router(crisis.router)      # Agent 3
```

---

## Migration Script

Create `alembic/versions/003_chat_crisis_tables.py`:

```python
"""Add chat and crisis tables

Revision ID: 003
Revises: 002
Create Date: 2026-02-02
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector

revision = '003'
down_revision = '002'


def upgrade() -> None:
    # Enable pgvector extension
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')

    # Chat sessions
    op.create_table(
        'chat_sessions',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('user_id', UUID(), nullable=False),
        sa.Column('title', sa.String(100), nullable=True),
        sa.Column('session_type', sa.String(30), default='general'),
        sa.Column('context_summary', sa.Text(), nullable=True),
        sa.Column('mood_context', JSONB(), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('message_count', sa.Integer(), default=0),
        sa.Column('last_message_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_chat_sessions_user_id', 'chat_sessions', ['user_id'])

    # Chat messages
    op.create_table(
        'chat_messages',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('session_id', UUID(), nullable=False),
        sa.Column('role', sa.String(10), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('model_used', sa.String(50), nullable=True),
        sa.Column('tokens_used', sa.Integer(), nullable=True),
        sa.Column('response_time_ms', sa.Integer(), nullable=True),
        sa.Column('crisis_detected', sa.Boolean(), default=False),
        sa.Column('content_filtered', sa.Boolean(), default=False),
        sa.Column('embedding', Vector(384), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['session_id'], ['chat_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_chat_messages_session_id', 'chat_messages', ['session_id'])

    # Crisis events
    op.create_table(
        'crisis_events',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('user_id', UUID(), nullable=False),
        sa.Column('trigger_source', sa.String(30), nullable=False),
        sa.Column('trigger_content_hash', sa.String(64), nullable=True),
        sa.Column('severity', sa.String(20), nullable=False),
        sa.Column('detection_confidence', sa.Float(), nullable=True),
        sa.Column('resources_shown', JSONB(), nullable=True),
        sa.Column('resource_clicked', sa.String(50), nullable=True),
        sa.Column('hotline_called', sa.Boolean(), default=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolution_type', sa.String(30), nullable=True),
        sa.Column('follow_up_scheduled', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_crisis_events_user_id', 'crisis_events', ['user_id'])

    # Crisis resources
    op.create_table(
        'crisis_resources',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('resource_type', sa.String(30), nullable=False),
        sa.Column('phone_number', sa.String(20), nullable=True),
        sa.Column('sms_number', sa.String(20), nullable=True),
        sa.Column('website_url', sa.String(500), nullable=True),
        sa.Column('available_24_7', sa.Boolean(), default=False),
        sa.Column('available_hours', JSONB(), nullable=True),
        sa.Column('countries', JSONB(), nullable=True),
        sa.Column('languages', JSONB(), nullable=True),
        sa.Column('specializations', JSONB(), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('priority', sa.SmallInteger(), default=5),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('crisis_resources')
    op.drop_table('crisis_events')
    op.drop_table('chat_messages')
    op.drop_table('chat_sessions')
```

---

## Seed Crisis Resources

Create `scripts/seed_crisis.py`:

```python
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.models.crisis import CrisisResource


CRISIS_RESOURCES = [
    {
        "name": "988 Suicide & Crisis Lifeline",
        "description": "Free, 24/7 support for people in distress. Call or text 988.",
        "resource_type": "hotline",
        "phone_number": "988",
        "sms_number": "988",
        "website_url": "https://988lifeline.org",
        "available_24_7": True,
        "countries": ["US"],
        "languages": ["en", "es"],
        "priority": 10,
    },
    {
        "name": "Crisis Text Line",
        "description": "Text HOME to 741741 to connect with a trained crisis counselor.",
        "resource_type": "text_line",
        "sms_number": "741741",
        "website_url": "https://www.crisistextline.org",
        "available_24_7": True,
        "countries": ["US"],
        "languages": ["en"],
        "priority": 9,
    },
    {
        "name": "SAMHSA National Helpline",
        "description": "Treatment referrals and information for mental health and substance use.",
        "resource_type": "hotline",
        "phone_number": "1-800-662-4357",
        "website_url": "https://www.samhsa.gov/find-help/national-helpline",
        "available_24_7": True,
        "countries": ["US"],
        "languages": ["en", "es"],
        "priority": 8,
    },
]


async def seed():
    async with AsyncSessionLocal() as db:
        for data in CRISIS_RESOURCES:
            resource = CrisisResource(**data)
            db.add(resource)
        await db.commit()
        print(f"Seeded {len(CRISIS_RESOURCES)} crisis resources")


if __name__ == "__main__":
    asyncio.run(seed())
```

---

## Checklist

- [ ] Gemini client works with API key
- [ ] Sentiment analysis loads model correctly
- [ ] Crisis detection patterns match appropriately
- [ ] Embeddings generate successfully
- [ ] Chat sessions CRUD works
- [ ] Messages trigger AI responses
- [ ] Crisis detection integrates with chat
- [ ] Crisis resources seeded
- [ ] Migration applies cleanly
- [ ] Tests pass

---

## Integration Notes

**For Agent 2**: Provide these interfaces for sentiment integration:

```python
# In mood_service.py create_log():
from app.ml.sentiment import sentiment_analyzer

if data.note:
    result = await sentiment_analyzer.analyze(data.note)
    log.note_sentiment = result["score"]

# In journal_service.py create_entry():
from app.ml.sentiment import sentiment_analyzer

result = await sentiment_analyzer.analyze(data.content)
entry.sentiment_score = result["score"]
entry.primary_emotion = await sentiment_analyzer.detect_emotion(data.content)
```
