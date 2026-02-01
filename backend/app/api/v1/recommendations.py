from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.recommendation import RecommendationResponse, PaginatedRecommendations
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("/daily", response_model=list[RecommendationResponse])
async def get_daily_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get or generate daily recommendations."""
    service = RecommendationService(db, current_user)
    return await service.generate_daily_recommendations()


@router.get("", response_model=PaginatedRecommendations)
async def list_recommendations(
    page: int = 1,
    per_page: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = RecommendationService(db, current_user)
    return await service.list_recommendations(page=page, per_page=per_page)
