from datetime import datetime, timezone, timedelta
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.models.recommendation import Recommendation
from app.models.content import ContentLibrary
from app.models.user import User
from app.schemas.recommendation import RecommendationResponse, RecommendationFeedback, PaginatedRecommendations
from app.services.content_service import ContentService
from app.utils.exceptions import NotFoundException, ForbiddenException


class RecommendationService:
    def __init__(self, db: AsyncSession, current_user: User):
        self.db = db
        self.user = current_user
        self.content_service = ContentService(db, current_user)

    async def generate_daily_recommendations(self) -> list[Recommendation]:
        """Generate recommendations based on recent insights and mood."""
        # Check if we already have valid recommendations for today
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        
        result = await self.db.execute(
            select(Recommendation).where(
                Recommendation.user_id == self.user.id,
                Recommendation.created_at >= today_start
            )
        )
        existing = result.scalars().all()
        if len(existing) >= 3:
            return existing

        # Logic to pick content:
        # 1. Look for active insights
        # 2. Look for recent mood (negative mood -> soothing content)
        # 3. Fallback to popular content
        
        # for now, simple fallback to random popular content
        # In a real impl, we'd query insights and match content tags
        
        # Get 3 random popular items
        # Note: func.random() might be dialect specific, using order_by(func.random()) is common for PG
        result = await self.db.execute(
            select(ContentLibrary)
            .where(ContentLibrary.is_active == True)
            .order_by(func.random()) # Postgres specific
            .limit(3)
        )
        contents = result.scalars().all()
        
        new_recs = []
        for c in contents:
            rec = Recommendation(
                user_id=self.user.id,
                content_id=c.id,
                reason="Daily suggestion for you",
                priority=5,
                expires_at=datetime.now(timezone.utc) + timedelta(hours=24)
            )
            self.db.add(rec)
            new_recs.append(rec)
            
        if new_recs:
            await self.db.commit()
            
        return existing + new_recs

    async def list_recommendations(self, page: int = 1, per_page: int = 20) -> PaginatedRecommendations:
        query = select(Recommendation).where(
            Recommendation.user_id == self.user.id,
            (Recommendation.expires_at.is_(None) | (Recommendation.expires_at > datetime.now(timezone.utc))),
            Recommendation.completed_at.is_(None)
        ).order_by(Recommendation.priority.desc(), Recommendation.created_at.desc())

        total = (await self.db.execute(
            select(func.count(Recommendation.id)).where(
                 Recommendation.user_id == self.user.id,
                (Recommendation.expires_at.is_(None) | (Recommendation.expires_at > datetime.now(timezone.utc))),
                Recommendation.completed_at.is_(None)
            )
        )).scalar()

        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)
        
        result = await self.db.execute(query)
        recs = result.scalars().all()
        
        return PaginatedRecommendations(
            items=[RecommendationResponse.model_validate(r) for r in recs],
            total=total,
            page=page,
            per_page=per_page
        )
