from uuid import UUID
import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.content import ContentLibrary
from app.models.user import User
from app.schemas.content import (
    ContentBrief,
    ContentDetail,
    PaginatedContent,
    ContentRating,
)
from app.utils.exceptions import NotFoundException


class ContentService:
    def __init__(self, db: AsyncSession, current_user: User | None = None):
        self.db = db
        self.user = current_user

    async def get_content(self, content_id: UUID) -> ContentDetail:
        result = await self.db.execute(
            select(ContentLibrary).where(
                ContentLibrary.id == content_id,
                ContentLibrary.is_active == True,
            )
        )
        content = result.scalar_one_or_none()

        if not content:
            raise NotFoundException("Content not found")

        # Check premium access
        if content.is_premium and self.user and not self.user.is_premium:
            pass # TODO: Enforce this later, for now just allow, or raise. 
            # The prompt had: raise NotFoundException("Premium content - upgrade to access")
            # I will uncomment it if User model has is_premium
            
        if content.is_premium and self.user and not getattr(self.user, 'is_premium', False):
             raise NotFoundException("Premium content - upgrade to access")

        # Increment view count
        content.view_count += 1
        await self.db.commit()

        return ContentDetail(
            id=content.id,
            content_type=content.content_type,
            title=content.title,
            description=content.description,
            duration_minutes=content.duration_minutes,
            image_url=content.image_url,
            is_premium=content.is_premium,
            content_body=content.content_body,
            difficulty=content.difficulty,
            instructions=content.instructions,
            audio_url=content.audio_url,
            target_moods=content.target_moods,
            avg_rating=content.avg_rating,
            view_count=content.view_count,
        )

    async def list_content(
        self,
        content_type: str | None = None,
        mood: str | None = None,
        difficulty: str | None = None,
        is_premium: bool | None = None,
        page: int = 1,
        per_page: int = 20,
    ) -> PaginatedContent:
        query = select(ContentLibrary).where(ContentLibrary.is_active == True)

        if content_type:
            query = query.where(ContentLibrary.content_type == content_type)
        if difficulty:
            query = query.where(ContentLibrary.difficulty == difficulty)
        if is_premium is not None:
            query = query.where(ContentLibrary.is_premium == is_premium)
        if mood:
            query = query.where(ContentLibrary.target_moods.contains([mood]))

        # Count
        count_query = select(func.count(ContentLibrary.id)).where(ContentLibrary.is_active == True)
        if content_type:
            count_query = count_query.where(ContentLibrary.content_type == content_type)
        # Note: applying all filters to count query properly requires more complex construction or re-using base query
        # For simplicity in this iteration, we focus on partial count filtering or assume optimized later.
        # But to be correct let's apply same filters.
        # Simplest way in sqlalchemy 1.4+ is select(func.count()).select_from(subquery) but here we can just reuse the where clauses?
        # Let's keep it simple for now, the 'count_query' above only adds content_type. 
        # Ideally we should copy the where clause.
        
        # Let's fix count query construction:
        # Re-apply filters
        count_query = select(func.count(ContentLibrary.id)).where(ContentLibrary.is_active == True)
        if content_type:
            count_query = count_query.where(ContentLibrary.content_type == content_type)
        if difficulty:
            count_query = count_query.where(ContentLibrary.difficulty == difficulty)
        if is_premium is not None:
             count_query = count_query.where(ContentLibrary.is_premium == is_premium)
        if mood:
            count_query = count_query.where(ContentLibrary.target_moods.contains([mood]))

        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Paginate
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)

        result = await self.db.execute(query)
        contents = result.scalars().all()

        return PaginatedContent(
            items=[ContentBrief.model_validate(c) for c in contents],
            total=total,
            page=page,
            per_page=per_page,
        )

    async def get_for_mood(self, mood: str, limit: int = 5) -> list[ContentLibrary]:
        """Get content suitable for a specific mood."""
        result = await self.db.execute(
            select(ContentLibrary)
            .where(
                ContentLibrary.is_active == True,
                ContentLibrary.target_moods.contains([mood]),
            )
            .order_by(ContentLibrary.avg_rating.desc().nullsfirst())
            .limit(limit)
        )
        return result.scalars().all()
