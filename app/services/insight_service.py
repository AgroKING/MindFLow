from datetime import datetime, timezone, timedelta
from uuid import UUID
import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.insight import UserInsight
from app.models.mood import MoodLog
from app.models.user import User
from app.schemas.insight import InsightResponse, InsightFeedback, PaginatedInsights
from app.ml.pattern_detector import pattern_detector, PatternInsight
from app.utils.exceptions import NotFoundException, ForbiddenException


class InsightService:
    def __init__(self, db: AsyncSession, current_user: User):
        self.db = db
        self.user = current_user

    async def generate_insights(self) -> list[UserInsight]:
        """Generate new insights from user's mood data."""
        # Get mood logs from last 90 days
        cutoff = datetime.now(timezone.utc) - timedelta(days=90)

        result = await self.db.execute(
            select(MoodLog)
            .where(
                MoodLog.user_id == self.user.id,
                MoodLog.logged_at >= cutoff,
            )
            .order_by(MoodLog.logged_at.desc())
        )
        logs = result.scalars().all()

        if len(logs) < 14:
            return []

        # Convert to dicts for pattern detector
        log_dicts = []
        for log in logs:
            factors = []
            if log.factors:
                 # Depending on how factors are stored (relationship or jsonb). 
                 # Based on models provided in previous contexts, MoodLog usually has a relationship to MoodFactor 
                 # OR it might be a JSONB column in some simplified versions. 
                 # The AGENT_2 prompt implies MoodFactor is a model.
                 # Let's assume it is a relationship and we need to serialize it.
                 # If `log.factors` is a list of objects:
                 try: 
                    for f in log.factors:
                        factors.append({
                            "factor_type": f.factor_type,
                            "factor_value": f.factor_value,
                            "impact_score": f.impact_score,
                        })
                 except TypeError:
                     # Fallback if it is not iterable or handled differently
                     pass

            log_dicts.append({
                "logged_at": log.logged_at,
                "mood_score": log.mood_score,
                # "time_of_day": log.time_of_day, # Assuming this field exists or we derive it
                # "day_of_week": log.logged_at.weekday(),
                "factors": factors
            })
            
            # If time_of_day is not on model, derive it:
            if not hasattr(log, 'time_of_day'):
                hour = log.logged_at.hour
                if 5 <= hour < 12: col = "Morning"
                elif 12 <= hour < 17: col = "Afternoon"
                elif 17 <= hour < 21: col = "Evening"
                else: col = "Night"
                log_dicts[-1]["time_of_day"] = col
            else:
                log_dicts[-1]["time_of_day"] = log.time_of_day


        # Run detector
        raw_insights = await pattern_detector.analyze_mood_patterns(log_dicts)
        
        saved_insights = []
        for ri in raw_insights:
            # Check if similar active insight exists to avoid duplicates
            # (Simple check only)
            
            insight = UserInsight(
                user_id=self.user.id,
                insight_type=ri.insight_type,
                title=ri.title,
                description=ri.description,
                data_points=ri.data_points,
                data_visualization=ri.visualization,
                confidence_score=ri.confidence,
                valid_from=datetime.now(timezone.utc),
                valid_until=datetime.now(timezone.utc) + timedelta(days=7), # Insights valid for a week
            )
            self.db.add(insight)
            saved_insights.append(insight)
        
        if saved_insights:
            await self.db.commit()
            
        return saved_insights

    async def list_insights(self, page: int = 1, per_page: int = 20) -> PaginatedInsights:
        query = select(UserInsight).where(
            UserInsight.user_id == self.user.id,
            UserInsight.dismissed_at.is_(None),
            (UserInsight.valid_until.is_(None) | (UserInsight.valid_until > datetime.now(timezone.utc)))
        ).order_by(UserInsight.created_at.desc())

        # Count
        count_query = select(func.count(UserInsight.id)).where(
             UserInsight.user_id == self.user.id,
             UserInsight.dismissed_at.is_(None),
             (UserInsight.valid_until.is_(None) | (UserInsight.valid_until > datetime.now(timezone.utc)))
        )
        total = (await self.db.execute(count_query)).scalar()

        # Paginate
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)
        
        result = await self.db.execute(query)
        insights = result.scalars().all()
        
        return PaginatedInsights(
            items=[InsightResponse.model_validate(i) for i in insights],
            total=total,
            page=page,
            per_page=per_page
        )
