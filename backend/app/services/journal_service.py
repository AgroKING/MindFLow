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
