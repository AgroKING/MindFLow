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
