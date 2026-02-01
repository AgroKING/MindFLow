from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.content import (
    ContentDetail,
    PaginatedContent,
    ContentQuery
)
from app.services.content_service import ContentService

router = APIRouter(prefix="/content", tags=["Content"])


@router.get("/{content_id}", response_model=ContentDetail)
async def get_content(
    content_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ContentService(db, current_user)
    return await service.get_content(content_id)


@router.get("", response_model=PaginatedContent)
async def list_content(
    params: ContentQuery = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ContentService(db, current_user)
    return await service.list_content(
        content_type=params.content_type,
        mood=params.mood,
        difficulty=params.difficulty,
        is_premium=params.is_premium,
        page=params.page,
        per_page=params.per_page,
    )
