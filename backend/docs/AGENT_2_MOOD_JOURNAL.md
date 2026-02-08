# Agent 2: Mood Logging & Journal System

## Your Role
You are responsible for the **mood tracking** and **journal** features of MindFlow. You build on top of Agent 1's foundation and work in parallel with Agents 3 and 4.

---

## Dependencies
- **Wait for Agent 1** to complete: database.py, models/base.py, api/deps.py, utils/security.py
- You can start once Agent 1's `/health` and `/auth` endpoints work

---

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Encryption | cryptography | 44.0+ |
| Time series | pandas | 2.2+ |
| All others | See Agent 1 | Same |

---

## Files You Own (CREATE THESE)

```
d:\newApp\app\
├── models/
│   ├── mood.py                      # MoodLog, MoodFactor
│   └── journal.py                   # JournalEntry
│
├── schemas/
│   ├── mood.py                      # Mood request/response schemas
│   └── journal.py                   # Journal schemas
│
├── services/
│   ├── mood_service.py              # Mood business logic
│   └── journal_service.py           # Journal with encryption
│
├── api/v1/
│   ├── mood.py                      # Mood endpoints
│   └── journal.py                   # Journal endpoints
│
└── utils/
    └── encryption.py                # AES encryption for journals

tests/
├── test_mood.py
└── test_journal.py

alembic/versions/
└── 002_mood_journal_tables.py
```

---

## Detailed Implementation

### 1. Add to `requirements.txt`

```txt
# Add these (Agent 1 has the base)
cryptography==44.0.0
pandas==2.2.3
```

### 2. `app/models/mood.py`

```python
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
```

### 3. `app/models/journal.py`

```python
from datetime import datetime
from uuid import UUID
from sqlalchemy import String, Integer, Text, Float, LargeBinary, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import BaseModel


class JournalEntry(BaseModel):
    __tablename__ = "journal_entries"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Encrypted content (E2E encrypted on client OR server-side encrypted)
    content_encrypted: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    content_iv: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)  # Initialization vector
    content_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)  # SHA-256 for integrity

    # Metadata (not encrypted, for querying)
    word_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    entry_type: Mapped[str] = mapped_column(String(20), default="freeform")  # freeform, prompted, gratitude, worry_dump
    prompt_id: Mapped[UUID | None] = mapped_column(nullable=True)  # Reference to prompt used

    # Derived analytics (computed from decrypted content, then stored)
    sentiment_score: Mapped[float | None] = mapped_column(Float, nullable=True)  # -1.0 to 1.0
    primary_emotion: Mapped[str | None] = mapped_column(String(30), nullable=True)  # joy, sadness, anxiety, anger, calm
    topics: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # ["work", "family", "health"]

    def __repr__(self):
        return f"<JournalEntry {self.id} type={self.entry_type}>"
```

### 4. `app/utils/encryption.py`

```python
import os
import hashlib
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from app.config import settings


def get_encryption_key() -> bytes:
    """Derive a 32-byte key from settings."""
    key = settings.encryption_key.encode()
    return hashlib.sha256(key).digest()


def encrypt_content(plaintext: str) -> tuple[bytes, bytes]:
    """
    Encrypt content using AES-256-GCM.
    Returns (ciphertext, iv).
    """
    key = get_encryption_key()
    iv = os.urandom(12)  # 96-bit IV for GCM

    cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
    encryptor = cipher.encryptor()

    ciphertext = encryptor.update(plaintext.encode()) + encryptor.finalize()

    # Append the tag to ciphertext
    return ciphertext + encryptor.tag, iv


def decrypt_content(ciphertext: bytes, iv: bytes) -> str:
    """
    Decrypt content using AES-256-GCM.
    """
    key = get_encryption_key()

    # Extract tag (last 16 bytes)
    tag = ciphertext[-16:]
    actual_ciphertext = ciphertext[:-16]

    cipher = Cipher(algorithms.AES(key), modes.GCM(iv, tag), backend=default_backend())
    decryptor = cipher.decryptor()

    plaintext = decryptor.update(actual_ciphertext) + decryptor.finalize()
    return plaintext.decode()


def hash_content(content: str) -> str:
    """Generate SHA-256 hash for content integrity."""
    return hashlib.sha256(content.encode()).hexdigest()
```

### 5. `app/schemas/mood.py`

```python
from datetime import datetime, date
from uuid import UUID
from typing import Literal
from pydantic import BaseModel, Field


class MoodFactorInput(BaseModel):
    factor_type: Literal["sleep", "exercise", "social", "work", "weather", "health"]
    factor_value: str | None = None
    impact_score: int | None = Field(None, ge=-5, le=5)


class MoodFactorResponse(BaseModel):
    id: UUID
    factor_type: str
    factor_value: str | None
    impact_score: int | None

    class Config:
        from_attributes = True


class MoodLogCreate(BaseModel):
    mood_score: int = Field(..., ge=1, le=10)
    energy_level: int | None = Field(None, ge=1, le=10)
    anxiety_level: int | None = Field(None, ge=1, le=10)
    note: str | None = Field(None, max_length=500)
    factors: list[MoodFactorInput] | None = None
    location_type: Literal["home", "work", "outdoors", "transit"] | None = None
    logged_at: datetime | None = None  # Defaults to now


class MoodLogUpdate(BaseModel):
    mood_score: int | None = Field(None, ge=1, le=10)
    energy_level: int | None = Field(None, ge=1, le=10)
    anxiety_level: int | None = Field(None, ge=1, le=10)
    note: str | None = Field(None, max_length=500)


class MoodLogResponse(BaseModel):
    id: UUID
    mood_score: int
    energy_level: int | None
    anxiety_level: int | None
    note: str | None
    note_sentiment: float | None
    factors: list[MoodFactorResponse]
    logged_at: datetime
    time_of_day: str | None
    location_type: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class MoodLogsQuery(BaseModel):
    start_date: date | None = None
    end_date: date | None = None
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)


class PaginatedMoodLogs(BaseModel):
    items: list[MoodLogResponse]
    total: int
    page: int
    per_page: int
    pages: int


class MoodStatsResponse(BaseModel):
    period: str  # "7d", "30d", "90d"
    avg_mood: float
    avg_energy: float | None
    avg_anxiety: float | None
    mood_trend: Literal["improving", "stable", "declining"]
    best_day: str | None  # Day of week
    worst_day: str | None
    total_logs: int
    streak_days: int  # Consecutive days with logs


class MoodTrendPoint(BaseModel):
    date: date
    avg_mood: float
    log_count: int


class MoodTrendsResponse(BaseModel):
    period: str
    data_points: list[MoodTrendPoint]
    overall_trend: float  # Slope of trend line
```

### 6. `app/schemas/journal.py`

```python
from datetime import datetime
from uuid import UUID
from typing import Literal
from pydantic import BaseModel, Field


class JournalEntryCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=50000)
    entry_type: Literal["freeform", "prompted", "gratitude", "worry_dump"] = "freeform"
    prompt_id: UUID | None = None


class JournalEntryUpdate(BaseModel):
    content: str | None = Field(None, min_length=1, max_length=50000)


class JournalEntryResponse(BaseModel):
    id: UUID
    entry_type: str
    word_count: int | None
    sentiment_score: float | None
    primary_emotion: str | None
    topics: list[str] | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JournalEntryDetail(JournalEntryResponse):
    content: str  # Decrypted content


class JournalEntriesQuery(BaseModel):
    entry_type: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)


class PaginatedJournalEntries(BaseModel):
    items: list[JournalEntryResponse]
    total: int
    page: int
    per_page: int
    pages: int


class JournalPrompt(BaseModel):
    id: UUID
    category: str
    prompt_text: str
    suitable_for: list[str]  # ["anxious", "sad", "reflective"]
```

### 7. `app/services/mood_service.py`

```python
from datetime import datetime, timezone, timedelta
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
import math

from app.models.mood import MoodLog, MoodFactor
from app.models.user import User
from app.schemas.mood import (
    MoodLogCreate,
    MoodLogUpdate,
    MoodLogResponse,
    PaginatedMoodLogs,
    MoodStatsResponse,
    MoodTrendsResponse,
    MoodTrendPoint,
)
from app.utils.exceptions import NotFoundException, ForbiddenException


class MoodService:
    def __init__(self, db: AsyncSession, current_user: User):
        self.db = db
        self.user = current_user

    def _get_time_of_day(self, dt: datetime) -> str:
        hour = dt.hour
        if 5 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 21:
            return "evening"
        else:
            return "night"

    async def create_log(self, data: MoodLogCreate) -> MoodLog:
        logged_at = data.logged_at or datetime.now(timezone.utc)

        log = MoodLog(
            user_id=self.user.id,
            mood_score=data.mood_score,
            energy_level=data.energy_level,
            anxiety_level=data.anxiety_level,
            note=data.note,
            logged_at=logged_at,
            time_of_day=self._get_time_of_day(logged_at),
            day_of_week=logged_at.weekday(),
            location_type=data.location_type,
        )

        # Add factors
        if data.factors:
            for factor_data in data.factors:
                factor = MoodFactor(
                    factor_type=factor_data.factor_type,
                    factor_value=factor_data.factor_value,
                    impact_score=factor_data.impact_score,
                )
                log.factors.append(factor)

        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def get_log(self, log_id: UUID) -> MoodLog:
        result = await self.db.execute(
            select(MoodLog)
            .options(selectinload(MoodLog.factors))
            .where(MoodLog.id == log_id)
        )
        log = result.scalar_one_or_none()

        if not log:
            raise NotFoundException("Mood log not found")
        if log.user_id != self.user.id:
            raise ForbiddenException("Not authorized to access this log")

        return log

    async def list_logs(
        self,
        page: int = 1,
        per_page: int = 20,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> PaginatedMoodLogs:
        query = (
            select(MoodLog)
            .options(selectinload(MoodLog.factors))
            .where(MoodLog.user_id == self.user.id)
            .order_by(MoodLog.logged_at.desc())
        )

        if start_date:
            query = query.where(MoodLog.logged_at >= start_date)
        if end_date:
            query = query.where(MoodLog.logged_at <= end_date)

        # Count total
        count_query = select(func.count(MoodLog.id)).where(MoodLog.user_id == self.user.id)
        if start_date:
            count_query = count_query.where(MoodLog.logged_at >= start_date)
        if end_date:
            count_query = count_query.where(MoodLog.logged_at <= end_date)

        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Paginate
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)

        result = await self.db.execute(query)
        logs = result.scalars().all()

        return PaginatedMoodLogs(
            items=[MoodLogResponse.model_validate(log) for log in logs],
            total=total,
            page=page,
            per_page=per_page,
            pages=math.ceil(total / per_page) if total > 0 else 1,
        )

    async def update_log(self, log_id: UUID, data: MoodLogUpdate) -> MoodLog:
        log = await self.get_log(log_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(log, field, value)

        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def delete_log(self, log_id: UUID) -> None:
        log = await self.get_log(log_id)
        await self.db.delete(log)
        await self.db.commit()

    async def get_stats(self, period: str = "30d") -> MoodStatsResponse:
        days_map = {"7d": 7, "30d": 30, "90d": 90}
        days = days_map.get(period, 30)

        start_date = datetime.now(timezone.utc) - timedelta(days=days)

        query = select(MoodLog).where(
            MoodLog.user_id == self.user.id,
            MoodLog.logged_at >= start_date,
        )
        result = await self.db.execute(query)
        logs = result.scalars().all()

        if not logs:
            return MoodStatsResponse(
                period=period,
                avg_mood=0,
                avg_energy=None,
                avg_anxiety=None,
                mood_trend="stable",
                best_day=None,
                worst_day=None,
                total_logs=0,
                streak_days=0,
            )

        # Calculate averages
        avg_mood = sum(log.mood_score for log in logs) / len(logs)
        energy_values = [log.energy_level for log in logs if log.energy_level]
        anxiety_values = [log.anxiety_level for log in logs if log.anxiety_level]

        avg_energy = sum(energy_values) / len(energy_values) if energy_values else None
        avg_anxiety = sum(anxiety_values) / len(anxiety_values) if anxiety_values else None

        # Day analysis
        day_scores: dict[int, list[int]] = {}
        for log in logs:
            day = log.day_of_week
            if day is not None:
                day_scores.setdefault(day, []).append(log.mood_score)

        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        best_day = None
        worst_day = None

        if day_scores:
            day_avgs = {d: sum(s) / len(s) for d, s in day_scores.items()}
            best_day = day_names[max(day_avgs, key=day_avgs.get)]
            worst_day = day_names[min(day_avgs, key=day_avgs.get)]

        # Trend calculation (simple: compare first half to second half)
        mid = len(logs) // 2
        if mid > 0:
            first_half_avg = sum(log.mood_score for log in logs[mid:]) / len(logs[mid:])
            second_half_avg = sum(log.mood_score for log in logs[:mid]) / mid
            diff = second_half_avg - first_half_avg
            trend = "improving" if diff > 0.5 else "declining" if diff < -0.5 else "stable"
        else:
            trend = "stable"

        # Streak calculation
        streak = await self._calculate_streak()

        return MoodStatsResponse(
            period=period,
            avg_mood=round(avg_mood, 2),
            avg_energy=round(avg_energy, 2) if avg_energy else None,
            avg_anxiety=round(avg_anxiety, 2) if avg_anxiety else None,
            mood_trend=trend,
            best_day=best_day,
            worst_day=worst_day,
            total_logs=len(logs),
            streak_days=streak,
        )

    async def _calculate_streak(self) -> int:
        """Calculate consecutive days with mood logs."""
        today = datetime.now(timezone.utc).date()
        streak = 0

        for i in range(365):  # Max 1 year lookback
            check_date = today - timedelta(days=i)
            result = await self.db.execute(
                select(func.count(MoodLog.id)).where(
                    MoodLog.user_id == self.user.id,
                    func.date(MoodLog.logged_at) == check_date,
                )
            )
            count = result.scalar()
            if count > 0:
                streak += 1
            else:
                break

        return streak

    async def get_trends(self, period: str = "30d") -> MoodTrendsResponse:
        days_map = {"7d": 7, "30d": 30, "90d": 90}
        days = days_map.get(period, 30)

        start_date = datetime.now(timezone.utc) - timedelta(days=days)

        query = (
            select(
                func.date(MoodLog.logged_at).label("date"),
                func.avg(MoodLog.mood_score).label("avg_mood"),
                func.count(MoodLog.id).label("log_count"),
            )
            .where(
                MoodLog.user_id == self.user.id,
                MoodLog.logged_at >= start_date,
            )
            .group_by(func.date(MoodLog.logged_at))
            .order_by(func.date(MoodLog.logged_at))
        )

        result = await self.db.execute(query)
        rows = result.all()

        data_points = [
            MoodTrendPoint(date=row.date, avg_mood=round(row.avg_mood, 2), log_count=row.log_count)
            for row in rows
        ]

        # Calculate overall trend (simple linear regression slope)
        if len(data_points) >= 2:
            n = len(data_points)
            x_sum = sum(range(n))
            y_sum = sum(p.avg_mood for p in data_points)
            xy_sum = sum(i * p.avg_mood for i, p in enumerate(data_points))
            x2_sum = sum(i * i for i in range(n))

            slope = (n * xy_sum - x_sum * y_sum) / (n * x2_sum - x_sum * x_sum)
        else:
            slope = 0

        return MoodTrendsResponse(
            period=period,
            data_points=data_points,
            overall_trend=round(slope, 4),
        )
```

### 8. `app/services/journal_service.py`

```python
from datetime import datetime, timezone
from uuid import UUID
import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.journal import JournalEntry
from app.models.user import User
from app.schemas.journal import (
    JournalEntryCreate,
    JournalEntryUpdate,
    JournalEntryResponse,
    JournalEntryDetail,
    PaginatedJournalEntries,
)
from app.utils.encryption import encrypt_content, decrypt_content, hash_content
from app.utils.exceptions import NotFoundException, ForbiddenException


class JournalService:
    def __init__(self, db: AsyncSession, current_user: User):
        self.db = db
        self.user = current_user

    async def create_entry(self, data: JournalEntryCreate) -> JournalEntry:
        # Encrypt content
        ciphertext, iv = encrypt_content(data.content)
        content_hash = hash_content(data.content)
        word_count = len(data.content.split())

        entry = JournalEntry(
            user_id=self.user.id,
            content_encrypted=ciphertext,
            content_iv=iv,
            content_hash=content_hash,
            word_count=word_count,
            entry_type=data.entry_type,
            prompt_id=data.prompt_id,
        )

        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def get_entry(self, entry_id: UUID, include_content: bool = False) -> JournalEntry | JournalEntryDetail:
        result = await self.db.execute(
            select(JournalEntry).where(JournalEntry.id == entry_id)
        )
        entry = result.scalar_one_or_none()

        if not entry:
            raise NotFoundException("Journal entry not found")
        if entry.user_id != self.user.id:
            raise ForbiddenException("Not authorized to access this entry")

        if include_content:
            content = decrypt_content(entry.content_encrypted, entry.content_iv)
            return JournalEntryDetail(
                id=entry.id,
                entry_type=entry.entry_type,
                word_count=entry.word_count,
                sentiment_score=entry.sentiment_score,
                primary_emotion=entry.primary_emotion,
                topics=entry.topics,
                created_at=entry.created_at,
                updated_at=entry.updated_at,
                content=content,
            )

        return entry

    async def list_entries(
        self,
        page: int = 1,
        per_page: int = 20,
        entry_type: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> PaginatedJournalEntries:
        query = select(JournalEntry).where(JournalEntry.user_id == self.user.id).order_by(JournalEntry.created_at.desc())

        if entry_type:
            query = query.where(JournalEntry.entry_type == entry_type)
        if start_date:
            query = query.where(JournalEntry.created_at >= start_date)
        if end_date:
            query = query.where(JournalEntry.created_at <= end_date)

        # Count
        count_query = select(func.count(JournalEntry.id)).where(JournalEntry.user_id == self.user.id)
        if entry_type:
            count_query = count_query.where(JournalEntry.entry_type == entry_type)
        if start_date:
            count_query = count_query.where(JournalEntry.created_at >= start_date)
        if end_date:
            count_query = count_query.where(JournalEntry.created_at <= end_date)

        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Paginate
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)

        result = await self.db.execute(query)
        entries = result.scalars().all()

        return PaginatedJournalEntries(
            items=[JournalEntryResponse.model_validate(entry) for entry in entries],
            total=total,
            page=page,
            per_page=per_page,
            pages=math.ceil(total / per_page) if total > 0 else 1,
        )

    async def update_entry(self, entry_id: UUID, data: JournalEntryUpdate) -> JournalEntry:
        result = await self.db.execute(
            select(JournalEntry).where(JournalEntry.id == entry_id)
        )
        entry = result.scalar_one_or_none()

        if not entry:
            raise NotFoundException("Journal entry not found")
        if entry.user_id != self.user.id:
            raise ForbiddenException("Not authorized to update this entry")

        if data.content:
            ciphertext, iv = encrypt_content(data.content)
            entry.content_encrypted = ciphertext
            entry.content_iv = iv
            entry.content_hash = hash_content(data.content)
            entry.word_count = len(data.content.split())

        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def delete_entry(self, entry_id: UUID) -> None:
        entry = await self.get_entry(entry_id)
        await self.db.delete(entry)
        await self.db.commit()
```

### 9. `app/api/v1/mood.py`

```python
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import CurrentUser
from app.schemas.mood import (
    MoodLogCreate,
    MoodLogUpdate,
    MoodLogResponse,
    PaginatedMoodLogs,
    MoodStatsResponse,
    MoodTrendsResponse,
)
from app.services.mood_service import MoodService

router = APIRouter(prefix="/mood", tags=["Mood Tracking"])


@router.post("/logs", response_model=MoodLogResponse, status_code=status.HTTP_201_CREATED)
async def create_mood_log(
    data: MoodLogCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Create a new mood log entry."""
    service = MoodService(db, current_user)
    log = await service.create_log(data)
    return log


@router.get("/logs", response_model=PaginatedMoodLogs)
async def list_mood_logs(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """List mood logs with pagination and optional date filtering."""
    service = MoodService(db, current_user)
    return await service.list_logs(page, per_page, start_date, end_date)


@router.get("/logs/{log_id}", response_model=MoodLogResponse)
async def get_mood_log(
    log_id: UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific mood log by ID."""
    service = MoodService(db, current_user)
    return await service.get_log(log_id)


@router.patch("/logs/{log_id}", response_model=MoodLogResponse)
async def update_mood_log(
    log_id: UUID,
    data: MoodLogUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Update a mood log."""
    service = MoodService(db, current_user)
    return await service.update_log(log_id, data)


@router.delete("/logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mood_log(
    log_id: UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Delete a mood log."""
    service = MoodService(db, current_user)
    await service.delete_log(log_id)
    return None


@router.get("/stats", response_model=MoodStatsResponse)
async def get_mood_stats(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    period: str = Query("30d", regex="^(7d|30d|90d)$"),
):
    """Get aggregated mood statistics."""
    service = MoodService(db, current_user)
    return await service.get_stats(period)


@router.get("/trends", response_model=MoodTrendsResponse)
async def get_mood_trends(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    period: str = Query("30d", regex="^(7d|30d|90d)$"),
):
    """Get mood trends over time."""
    service = MoodService(db, current_user)
    return await service.get_trends(period)
```

### 10. `app/api/v1/journal.py`

```python
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import CurrentUser
from app.schemas.journal import (
    JournalEntryCreate,
    JournalEntryUpdate,
    JournalEntryResponse,
    JournalEntryDetail,
    PaginatedJournalEntries,
)
from app.services.journal_service import JournalService

router = APIRouter(prefix="/journal", tags=["Journal"])


@router.post("/entries", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    data: JournalEntryCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Create a new journal entry (content will be encrypted)."""
    service = JournalService(db, current_user)
    entry = await service.create_entry(data)
    return entry


@router.get("/entries", response_model=PaginatedJournalEntries)
async def list_journal_entries(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    entry_type: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """List journal entries (without content for privacy)."""
    service = JournalService(db, current_user)
    return await service.list_entries(page, per_page, entry_type, start_date, end_date)


@router.get("/entries/{entry_id}", response_model=JournalEntryDetail)
async def get_journal_entry(
    entry_id: UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific journal entry with decrypted content."""
    service = JournalService(db, current_user)
    return await service.get_entry(entry_id, include_content=True)


@router.patch("/entries/{entry_id}", response_model=JournalEntryResponse)
async def update_journal_entry(
    entry_id: UUID,
    data: JournalEntryUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Update a journal entry."""
    service = JournalService(db, current_user)
    return await service.update_entry(entry_id, data)


@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_journal_entry(
    entry_id: UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Delete a journal entry."""
    service = JournalService(db, current_user)
    await service.delete_entry(entry_id)
    return None
```

### 11. Update `app/api/v1/router.py`

Add to the imports and includes in Agent 1's router.py:

```python
from app.api.v1 import auth, mood, journal

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(mood.router)      # Agent 2
api_router.include_router(journal.router)   # Agent 2
```

---

## Migration Script

Create `alembic/versions/002_mood_journal_tables.py`:

```python
"""Add mood and journal tables

Revision ID: 002
Revises: 001
Create Date: 2026-02-02
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Mood logs
    op.create_table(
        'mood_logs',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('user_id', UUID(), nullable=False),
        sa.Column('mood_score', sa.SmallInteger(), nullable=False),
        sa.Column('energy_level', sa.SmallInteger(), nullable=True),
        sa.Column('anxiety_level', sa.SmallInteger(), nullable=True),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('note_sentiment', sa.Float(), nullable=True),
        sa.Column('logged_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('time_of_day', sa.String(20), nullable=True),
        sa.Column('day_of_week', sa.SmallInteger(), nullable=True),
        sa.Column('location_type', sa.String(30), nullable=True),
        sa.Column('processed_for_insights', sa.Boolean(), default=False),
        sa.Column('crisis_flag_triggered', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_mood_logs_user_id', 'mood_logs', ['user_id'])

    # Mood factors
    op.create_table(
        'mood_factors',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('mood_log_id', UUID(), nullable=False),
        sa.Column('factor_type', sa.String(30), nullable=False),
        sa.Column('factor_value', sa.String(50), nullable=True),
        sa.Column('impact_score', sa.SmallInteger(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['mood_log_id'], ['mood_logs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # Journal entries
    op.create_table(
        'journal_entries',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('user_id', UUID(), nullable=False),
        sa.Column('content_encrypted', sa.LargeBinary(), nullable=False),
        sa.Column('content_iv', sa.LargeBinary(), nullable=False),
        sa.Column('content_hash', sa.String(64), nullable=True),
        sa.Column('word_count', sa.Integer(), nullable=True),
        sa.Column('entry_type', sa.String(20), default='freeform'),
        sa.Column('prompt_id', UUID(), nullable=True),
        sa.Column('sentiment_score', sa.Float(), nullable=True),
        sa.Column('primary_emotion', sa.String(30), nullable=True),
        sa.Column('topics', JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_journal_entries_user_id', 'journal_entries', ['user_id'])


def downgrade() -> None:
    op.drop_table('journal_entries')
    op.drop_table('mood_factors')
    op.drop_table('mood_logs')
```

---

## Checklist

- [ ] Models created with proper relationships
- [ ] Encryption utility works correctly
- [ ] All CRUD operations functional
- [ ] Pagination works
- [ ] Stats and trends calculations correct
- [ ] Journal content encrypts/decrypts properly
- [ ] Migration applies cleanly
- [ ] Tests pass

---

## Notes for Agent 3 (Chat & AI)

When you implement sentiment analysis for mood notes and journal entries:
1. Call your sentiment service from `MoodService.create_log()` to set `note_sentiment`
2. Call your sentiment service from `JournalService.create_entry()` to set `sentiment_score` and `primary_emotion`
3. The models have fields ready for you to populate
