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
