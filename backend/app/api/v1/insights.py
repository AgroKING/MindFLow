from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.insight import InsightResponse, PaginatedInsights
from app.services.insight_service import InsightService

router = APIRouter(prefix="/insights", tags=["Insights"])


@router.post("/generate", response_model=list[InsightResponse])
async def generate_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger on-demand insight generation."""
    service = InsightService(db, current_user)
    return await service.generate_insights()


@router.get("", response_model=PaginatedInsights)
async def list_insights(
    page: int = 1,
    per_page: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = InsightService(db, current_user)
    return await service.list_insights(page=page, per_page=per_page)
