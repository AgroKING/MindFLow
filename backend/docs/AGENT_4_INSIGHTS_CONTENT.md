# Agent 4: Insights, Recommendations & Content Library

## Your Role
You are responsible for the **AI-generated insights**, **personalized recommendations**, **content library** (exercises, tips, meditations), and **pattern detection**. You build on Agent 1's foundation and work in parallel with Agents 2 and 3.

---

## Dependencies
- **Wait for Agent 1** to complete: database, auth, base models
- **Agent 2** creates mood/journal data that you analyze for patterns
- **Agent 3** provides sentiment scores you can use
- You can start after Agent 1 is done

---

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Time series | prophet | 1.1+ |
| Analytics | pandas, numpy | Latest |
| ML | scikit-learn | 1.6+ |
| All others | See Agent 1 | Same |

---

## Files You Own (CREATE THESE)

```
d:\newApp\app\
├── models/
│   ├── insight.py                   # UserInsight
│   ├── recommendation.py            # Recommendation
│   └── content.py                   # ContentLibrary
│
├── schemas/
│   ├── insight.py                   # Insight schemas
│   ├── recommendation.py            # Recommendation schemas
│   └── content.py                   # Content schemas
│
├── services/
│   ├── insight_service.py           # Insight generation
│   ├── recommendation_service.py    # Personalized suggestions
│   └── content_service.py           # Content library management
│
├── ml/
│   └── pattern_detector.py          # Time-series pattern detection
│
├── api/v1/
│   ├── insights.py                  # Insight endpoints
│   ├── recommendations.py           # Recommendation endpoints
│   └── content.py                   # Content library endpoints

tests/
├── test_insights.py
└── test_recommendations.py

scripts/
└── seed_content.py                  # Seed the content library

alembic/versions/
└── 004_insights_content_tables.py
```

---

## Detailed Implementation

### 1. Add to `requirements.txt`

```txt
# Add these (Agent 1 has the base)
prophet==1.1.6
pandas==2.2.3
numpy==2.2.2
scikit-learn==1.6.1
```

### 2. `app/models/content.py`

```python
from sqlalchemy import String, Text, SmallInteger, Boolean, Float, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import BaseModel


class ContentLibrary(BaseModel):
    __tablename__ = "content_library"

    content_type: Mapped[str] = mapped_column(String(30), nullable=False)  # breathing, meditation, grounding, tip, article
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Content body
    content_body: Mapped[str | None] = mapped_column(Text, nullable=True)  # Markdown or structured content
    duration_minutes: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    difficulty: Mapped[str | None] = mapped_column(String(20), nullable=True)  # beginner, intermediate, advanced

    # Instructions for exercises
    instructions: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # Ordered list of steps

    # Targeting
    target_moods: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # ["anxious", "sad", "stressed"]
    target_factors: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # ["sleep", "work"]

    # Media
    audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Metadata
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    avg_rating: Mapped[float | None] = mapped_column(Float, nullable=True)

    def __repr__(self):
        return f"<Content {self.title}>"
```

### 3. `app/models/insight.py`

```python
from datetime import datetime
from uuid import UUID
from sqlalchemy import String, Text, Float, SmallInteger, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class UserInsight(BaseModel):
    __tablename__ = "user_insights"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    insight_type: Mapped[str] = mapped_column(String(30), nullable=False)  # pattern, correlation, trend, milestone
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    # Supporting data
    data_points: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # IDs and dates supporting this insight
    data_visualization: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # Chart config for frontend
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Engagement tracking
    shown_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    dismissed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    helpful_rating: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)  # 1-5

    # Validity period
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    valid_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    recommendations: Mapped[list["Recommendation"]] = relationship(back_populates="insight", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Insight {self.title}>"


from app.models.recommendation import Recommendation  # noqa: E402
```

### 4. `app/models/recommendation.py`

```python
from datetime import datetime
from uuid import UUID
from sqlalchemy import String, SmallInteger, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class Recommendation(BaseModel):
    __tablename__ = "recommendations"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    insight_id: Mapped[UUID | None] = mapped_column(ForeignKey("user_insights.id", ondelete="SET NULL"), nullable=True)
    content_id: Mapped[UUID] = mapped_column(ForeignKey("content_library.id", ondelete="CASCADE"), nullable=False)

    reason: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Why this was recommended
    priority: Mapped[int] = mapped_column(SmallInteger, default=5)  # 1-10

    # Engagement tracking
    shown_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    clicked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    feedback: Mapped[str | None] = mapped_column(String(20), nullable=True)  # helpful, not_helpful, skip

    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    insight: Mapped["UserInsight | None"] = relationship(back_populates="recommendations")
    content: Mapped["ContentLibrary"] = relationship()

    def __repr__(self):
        return f"<Recommendation {self.id}>"


from app.models.insight import UserInsight  # noqa: E402
from app.models.content import ContentLibrary  # noqa: E402
```

### 5. `app/ml/pattern_detector.py`

```python
from datetime import datetime, timedelta, timezone
from dataclasses import dataclass
import pandas as pd
import numpy as np
from prophet import Prophet
import logging

logger = logging.getLogger(__name__)


@dataclass
class PatternInsight:
    insight_type: str  # pattern, correlation, trend, milestone
    title: str
    description: str
    confidence: float
    data_points: dict
    visualization: dict | None = None


class PatternDetector:
    """Detects patterns in mood and wellness data."""

    def __init__(self):
        pass

    async def analyze_mood_patterns(
        self,
        mood_logs: list[dict],  # List of {date, mood_score, time_of_day, day_of_week, factors}
        min_days: int = 14,
    ) -> list[PatternInsight]:
        """Analyze mood logs to find patterns."""
        if len(mood_logs) < min_days:
            return []

        insights = []
        df = pd.DataFrame(mood_logs)
        df["date"] = pd.to_datetime(df["logged_at"])

        # 1. Weekly patterns
        weekly_insight = self._detect_weekly_pattern(df)
        if weekly_insight:
            insights.append(weekly_insight)

        # 2. Time-of-day patterns
        tod_insight = self._detect_time_of_day_pattern(df)
        if tod_insight:
            insights.append(tod_insight)

        # 3. Overall trend (with Prophet)
        if len(df) >= 21:
            trend_insight = await self._detect_trend(df)
            if trend_insight:
                insights.append(trend_insight)

        # 4. Streak milestone
        streak = self._calculate_streak(df)
        if streak >= 7:
            insights.append(self._create_streak_milestone(streak))

        # 5. Factor correlations
        if "factors" in df.columns:
            factor_insights = self._detect_factor_correlations(df)
            insights.extend(factor_insights)

        return insights

    def _detect_weekly_pattern(self, df: pd.DataFrame) -> PatternInsight | None:
        """Detect weekly day-of-week patterns."""
        if "day_of_week" not in df.columns:
            df["day_of_week"] = df["date"].dt.dayofweek

        day_avg = df.groupby("day_of_week")["mood_score"].mean()

        if len(day_avg) < 5:  # Need most days represented
            return None

        best_day = day_avg.idxmax()
        worst_day = day_avg.idxmin()
        diff = day_avg[best_day] - day_avg[worst_day]

        if diff < 1.0:  # Not significant enough
            return None

        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        return PatternInsight(
            insight_type="pattern",
            title=f"Your {day_names[worst_day]}s tend to be harder",
            description=(
                f"Your average mood on {day_names[worst_day]}s is {day_avg[worst_day]:.1f}/10, "
                f"compared to {day_avg[best_day]:.1f}/10 on {day_names[best_day]}s. "
                "Consider preparing some self-care activities for those days."
            ),
            confidence=min(0.85, len(df) / 60),
            data_points={
                "worst_day": day_names[worst_day],
                "worst_avg": round(day_avg[worst_day], 2),
                "best_day": day_names[best_day],
                "best_avg": round(day_avg[best_day], 2),
            },
            visualization={
                "type": "bar",
                "labels": day_names,
                "data": [round(day_avg.get(i, 0), 2) for i in range(7)],
            },
        )

    def _detect_time_of_day_pattern(self, df: pd.DataFrame) -> PatternInsight | None:
        """Detect time-of-day patterns."""
        if "time_of_day" not in df.columns or df["time_of_day"].isna().all():
            return None

        tod_avg = df.groupby("time_of_day")["mood_score"].mean()

        if len(tod_avg) < 2:
            return None

        best_time = tod_avg.idxmax()
        worst_time = tod_avg.idxmin()
        diff = tod_avg[best_time] - tod_avg[worst_time]

        if diff < 1.5:
            return None

        return PatternInsight(
            insight_type="pattern",
            title=f"You feel best in the {best_time}",
            description=(
                f"Your average mood in the {best_time} is {tod_avg[best_time]:.1f}/10, "
                f"while {worst_time}s average {tod_avg[worst_time]:.1f}/10. "
                "Consider scheduling important activities during your best times."
            ),
            confidence=min(0.8, len(df) / 50),
            data_points={
                "best_time": best_time,
                "best_avg": round(tod_avg[best_time], 2),
                "worst_time": worst_time,
                "worst_avg": round(tod_avg[worst_time], 2),
            },
        )

    async def _detect_trend(self, df: pd.DataFrame) -> PatternInsight | None:
        """Use Prophet to detect mood trend over time."""
        try:
            # Prepare data for Prophet
            prophet_df = df.groupby(df["date"].dt.date)["mood_score"].mean().reset_index()
            prophet_df.columns = ["ds", "y"]
            prophet_df["ds"] = pd.to_datetime(prophet_df["ds"])

            if len(prophet_df) < 14:
                return None

            model = Prophet(
                daily_seasonality=False,
                weekly_seasonality=True,
                yearly_seasonality=False,
                changepoint_prior_scale=0.1,
            )
            model.fit(prophet_df)

            # Get trend component
            future = model.make_future_dataframe(periods=0)
            forecast = model.predict(future)

            # Calculate trend direction
            trend_start = forecast["trend"].iloc[0]
            trend_end = forecast["trend"].iloc[-1]
            trend_change = trend_end - trend_start

            if abs(trend_change) < 0.5:
                return None

            if trend_change > 0:
                title = "Your mood is trending upward! 📈"
                description = (
                    f"Over the past {len(prophet_df)} days, your mood has improved by "
                    f"about {abs(trend_change):.1f} points. Keep doing what works for you!"
                )
            else:
                title = "Your mood has been declining 📉"
                description = (
                    f"Over the past {len(prophet_df)} days, your mood has dropped by "
                    f"about {abs(trend_change):.1f} points. Consider what changes might help."
                )

            return PatternInsight(
                insight_type="trend",
                title=title,
                description=description,
                confidence=min(0.9, len(prophet_df) / 45),
                data_points={
                    "trend_change": round(trend_change, 2),
                    "days_analyzed": len(prophet_df),
                },
                visualization={
                    "type": "line",
                    "labels": prophet_df["ds"].dt.strftime("%m/%d").tolist(),
                    "data": forecast["trend"].round(2).tolist(),
                },
            )

        except Exception as e:
            logger.error(f"Prophet trend detection failed: {e}")
            return None

    def _calculate_streak(self, df: pd.DataFrame) -> int:
        """Calculate consecutive days with mood logs."""
        dates = df["date"].dt.date.unique()
        dates = sorted(dates, reverse=True)

        if len(dates) == 0:
            return 0

        streak = 1
        today = datetime.now(timezone.utc).date()

        # Check if most recent log is within last day
        if (today - dates[0]).days > 1:
            return 0

        for i in range(1, len(dates)):
            if (dates[i - 1] - dates[i]).days == 1:
                streak += 1
            else:
                break

        return streak

    def _create_streak_milestone(self, streak: int) -> PatternInsight:
        """Create a milestone insight for streaks."""
        if streak >= 30:
            title = f"🔥 Amazing! {streak}-day logging streak!"
            msg = "You've built an incredible habit. This consistency is a powerful tool for self-awareness."
        elif streak >= 14:
            title = f"🌟 Two weeks strong! {streak}-day streak"
            msg = "Two weeks of consistent logging! You're building valuable self-insight."
        else:
            title = f"✨ {streak}-day streak!"
            msg = "You're building a great habit. Keep going!"

        return PatternInsight(
            insight_type="milestone",
            title=title,
            description=msg,
            confidence=1.0,
            data_points={"streak_days": streak},
        )

    def _detect_factor_correlations(self, df: pd.DataFrame) -> list[PatternInsight]:
        """Detect correlations between factors and mood."""
        insights = []

        # Flatten factors into columns
        factor_rows = []
        for _, row in df.iterrows():
            if row.get("factors"):
                for factor in row["factors"]:
                    factor_rows.append({
                        "mood_score": row["mood_score"],
                        "factor_type": factor.get("factor_type"),
                        "factor_value": factor.get("factor_value"),
                        "impact_score": factor.get("impact_score"),
                    })

        if len(factor_rows) < 10:
            return insights

        factor_df = pd.DataFrame(factor_rows)

        # Analyze by factor type
        for factor_type in factor_df["factor_type"].unique():
            type_data = factor_df[factor_df["factor_type"] == factor_type]

            if len(type_data) < 5:
                continue

            # Check if impact scores correlate with mood
            if type_data["impact_score"].notna().sum() >= 5:
                corr = type_data["mood_score"].corr(type_data["impact_score"])

                if abs(corr) > 0.3:
                    if corr > 0:
                        title = f"Good {factor_type} = better mood"
                        desc = f"When you rate your {factor_type} positively, your mood tends to be higher."
                    else:
                        title = f"Poor {factor_type} affects your mood"
                        desc = f"Challenges with {factor_type} seem to impact your overall mood."

                    insights.append(PatternInsight(
                        insight_type="correlation",
                        title=title,
                        description=desc,
                        confidence=min(0.75, abs(corr)),
                        data_points={
                            "factor_type": factor_type,
                            "correlation": round(corr, 2),
                            "sample_size": len(type_data),
                        },
                    ))

        return insights[:3]  # Limit to top 3


# Singleton
pattern_detector = PatternDetector()
```

### 6. `app/schemas/content.py`

```python
from datetime import datetime
from uuid import UUID
from typing import Literal
from pydantic import BaseModel, Field


class ContentBrief(BaseModel):
    id: UUID
    content_type: str
    title: str
    description: str | None
    duration_minutes: int | None
    image_url: str | None
    is_premium: bool

    class Config:
        from_attributes = True


class ContentDetail(ContentBrief):
    content_body: str | None
    difficulty: str | None
    instructions: list[str] | None
    audio_url: str | None
    target_moods: list[str] | None
    avg_rating: float | None
    view_count: int


class ContentQuery(BaseModel):
    content_type: Literal["breathing", "meditation", "grounding", "tip", "article"] | None = None
    mood: str | None = None  # Filter by target mood
    difficulty: str | None = None
    is_premium: bool | None = None
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)


class PaginatedContent(BaseModel):
    items: list[ContentBrief]
    total: int
    page: int
    per_page: int


class ContentRating(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    feedback: str | None = None
```

### 7. `app/schemas/insight.py`

```python
from datetime import datetime
from uuid import UUID
from typing import Literal
from pydantic import BaseModel, Field


class InsightResponse(BaseModel):
    id: UUID
    insight_type: Literal["pattern", "correlation", "trend", "milestone"]
    title: str
    description: str
    confidence_score: float | None
    data_visualization: dict | None
    created_at: datetime

    class Config:
        from_attributes = True


class InsightFeedback(BaseModel):
    helpful_rating: int = Field(..., ge=1, le=5)
    feedback_text: str | None = None


class PaginatedInsights(BaseModel):
    items: list[InsightResponse]
    total: int
    page: int
    per_page: int
```

### 8. `app/schemas/recommendation.py`

```python
from datetime import datetime
from uuid import UUID
from typing import Literal
from pydantic import BaseModel, Field
from app.schemas.content import ContentBrief


class RecommendationResponse(BaseModel):
    id: UUID
    content: ContentBrief
    reason: str | None
    priority: int
    expires_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class RecommendationFeedback(BaseModel):
    feedback: Literal["helpful", "not_helpful", "skip"]


class PaginatedRecommendations(BaseModel):
    items: list[RecommendationResponse]
    total: int
    page: int
    per_page: int
```

### 9. `app/services/content_service.py`

```python
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
```

### 10. `app/services/insight_service.py`

```python
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
            for f in log.factors:
                factors.append({
                    "factor_type": f.factor_type,
                    "factor_value": f.factor_value,
                    "impact_score": f.impact_score,
                })

            log_dicts.append({
                "logged_at": log.logged_at,
                "mood_score": log.mood_score,
                "time_of_day": log.time_of_day,
                "day_of_week": log.day_of_week,
                "factors": factors,
            })

        # Run pattern detection
        patterns = await pattern_detector.analyze_mood_patterns(log_dicts)

        # Create insight records
        created_insights = []
        now = datetime.now(timezone.utc)

        for pattern in patterns:
            insight = UserInsight(
                user_id=self.user.id,
                insight_type=pattern.insight_type,
                title=pattern.title,
                description=pattern.description,
                data_points=pattern.data_points,
                data_visualization=pattern.visualization,
                confidence_score=pattern.confidence,
                valid_from=now,
                valid_until=now + timedelta(days=30),  # Insights valid for 30 days
            )
            self.db.add(insight)
            created_insights.append(insight)

        await self.db.commit()

        return created_insights

    async def get_insight(self, insight_id: UUID) -> UserInsight:
        result = await self.db.execute(
            select(UserInsight).where(UserInsight.id == insight_id)
        )
        insight = result.scalar_one_or_none()

        if not insight:
            raise NotFoundException("Insight not found")
        if insight.user_id != self.user.id:
            raise ForbiddenException("Not authorized")

        return insight

    async def list_insights(
        self,
        page: int = 1,
        per_page: int = 20,
        include_expired: bool = False,
    ) -> PaginatedInsights:
        now = datetime.now(timezone.utc)

        query = select(UserInsight).where(
            UserInsight.user_id == self.user.id,
            UserInsight.dismissed_at.is_(None),
        )

        if not include_expired:
            query = query.where(
                (UserInsight.valid_until.is_(None)) | (UserInsight.valid_until >= now)
            )

        query = query.order_by(UserInsight.created_at.desc())

        # Count
        count_query = select(func.count(UserInsight.id)).where(
            UserInsight.user_id == self.user.id,
            UserInsight.dismissed_at.is_(None),
        )
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Paginate
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)

        result = await self.db.execute(query)
        insights = result.scalars().all()

        # Mark as shown
        for insight in insights:
            if not insight.shown_at:
                insight.shown_at = now

        await self.db.commit()

        return PaginatedInsights(
            items=[InsightResponse.model_validate(i) for i in insights],
            total=total,
            page=page,
            per_page=per_page,
        )

    async def submit_feedback(self, insight_id: UUID, feedback: InsightFeedback) -> None:
        insight = await self.get_insight(insight_id)
        insight.helpful_rating = feedback.helpful_rating
        await self.db.commit()

    async def dismiss_insight(self, insight_id: UUID) -> None:
        insight = await self.get_insight(insight_id)
        insight.dismissed_at = datetime.now(timezone.utc)
        await self.db.commit()
```

### 11. `app/services/recommendation_service.py`

```python
from datetime import datetime, timezone, timedelta
from uuid import UUID
import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.recommendation import Recommendation
from app.models.mood import MoodLog
from app.models.user import User
from app.schemas.recommendation import (
    RecommendationResponse,
    RecommendationFeedback,
    PaginatedRecommendations,
)
from app.schemas.content import ContentBrief
from app.services.content_service import ContentService
from app.utils.exceptions import NotFoundException, ForbiddenException


class RecommendationService:
    def __init__(self, db: AsyncSession, current_user: User):
        self.db = db
        self.user = current_user

    async def generate_recommendations(self) -> list[Recommendation]:
        """Generate personalized recommendations based on recent mood."""
        # Get recent mood data
        cutoff = datetime.now(timezone.utc) - timedelta(days=7)

        result = await self.db.execute(
            select(MoodLog)
            .where(
                MoodLog.user_id == self.user.id,
                MoodLog.logged_at >= cutoff,
            )
            .order_by(MoodLog.logged_at.desc())
            .limit(10)
        )
        recent_logs = result.scalars().all()

        if not recent_logs:
            return []

        # Determine dominant mood state
        avg_mood = sum(log.mood_score for log in recent_logs) / len(recent_logs)
        avg_anxiety = None

        anxiety_logs = [log.anxiety_level for log in recent_logs if log.anxiety_level]
        if anxiety_logs:
            avg_anxiety = sum(anxiety_logs) / len(anxiety_logs)

        # Map to content targeting
        target_moods = []
        if avg_mood < 4:
            target_moods.extend(["sad", "low"])
        if avg_anxiety and avg_anxiety > 6:
            target_moods.append("anxious")
        if avg_mood >= 4 and avg_mood <= 6:
            target_moods.append("neutral")
        if not target_moods:
            target_moods = ["general"]

        # Get suitable content
        content_service = ContentService(self.db, self.user)
        recommendations = []

        for mood in target_moods[:2]:  # Limit to 2 moods
            contents = await content_service.get_for_mood(mood, limit=3)

            for content in contents:
                # Check if already recommended recently
                existing = await self.db.execute(
                    select(Recommendation).where(
                        Recommendation.user_id == self.user.id,
                        Recommendation.content_id == content.id,
                        Recommendation.created_at >= cutoff,
                    )
                )
                if existing.scalar_one_or_none():
                    continue

                recommendation = Recommendation(
                    user_id=self.user.id,
                    content_id=content.id,
                    reason=self._generate_reason(mood, avg_mood, avg_anxiety),
                    priority=self._calculate_priority(content, avg_mood),
                    expires_at=datetime.now(timezone.utc) + timedelta(days=7),
                )
                self.db.add(recommendation)
                recommendations.append(recommendation)

        await self.db.commit()
        return recommendations[:5]  # Max 5 recommendations

    def _generate_reason(self, mood: str, avg_mood: float, avg_anxiety: float | None) -> str:
        reasons = {
            "anxious": "Based on elevated anxiety levels this week",
            "sad": "To help lift your mood during this difficult time",
            "low": "Because your energy has been lower recently",
            "neutral": "To maintain your balanced state",
            "general": "Recommended for your wellness journey",
        }
        return reasons.get(mood, reasons["general"])

    def _calculate_priority(self, content, avg_mood: float) -> int:
        base = 5
        if avg_mood < 4:
            base += 2  # Higher priority when mood is low
        if content.avg_rating and content.avg_rating > 4:
            base += 1
        return min(base, 10)

    async def get_recommendations(
        self,
        page: int = 1,
        per_page: int = 10,
        include_completed: bool = False,
    ) -> PaginatedRecommendations:
        now = datetime.now(timezone.utc)

        query = (
            select(Recommendation)
            .options(selectinload(Recommendation.content))
            .where(
                Recommendation.user_id == self.user.id,
                (Recommendation.expires_at.is_(None)) | (Recommendation.expires_at >= now),
            )
        )

        if not include_completed:
            query = query.where(Recommendation.completed_at.is_(None))

        query = query.order_by(Recommendation.priority.desc(), Recommendation.created_at.desc())

        # Count
        count_query = select(func.count(Recommendation.id)).where(
            Recommendation.user_id == self.user.id,
        )
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Paginate
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)

        result = await self.db.execute(query)
        recs = result.scalars().all()

        # Mark as shown
        for rec in recs:
            if not rec.shown_at:
                rec.shown_at = now

        await self.db.commit()

        items = []
        for rec in recs:
            items.append(RecommendationResponse(
                id=rec.id,
                content=ContentBrief.model_validate(rec.content),
                reason=rec.reason,
                priority=rec.priority,
                expires_at=rec.expires_at,
                created_at=rec.created_at,
            ))

        return PaginatedRecommendations(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
        )

    async def mark_started(self, rec_id: UUID) -> None:
        rec = await self._get_recommendation(rec_id)
        rec.clicked_at = datetime.now(timezone.utc)
        await self.db.commit()

    async def mark_completed(self, rec_id: UUID) -> None:
        rec = await self._get_recommendation(rec_id)
        rec.completed_at = datetime.now(timezone.utc)
        await self.db.commit()

    async def submit_feedback(self, rec_id: UUID, feedback: RecommendationFeedback) -> None:
        rec = await self._get_recommendation(rec_id)
        rec.feedback = feedback.feedback
        await self.db.commit()

    async def _get_recommendation(self, rec_id: UUID) -> Recommendation:
        result = await self.db.execute(
            select(Recommendation).where(Recommendation.id == rec_id)
        )
        rec = result.scalar_one_or_none()

        if not rec:
            raise NotFoundException("Recommendation not found")
        if rec.user_id != self.user.id:
            raise ForbiddenException("Not authorized")

        return rec
```

### 12. `app/api/v1/insights.py`

```python
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import CurrentUser
from app.schemas.insight import InsightResponse, InsightFeedback, PaginatedInsights
from app.services.insight_service import InsightService

router = APIRouter(prefix="/insights", tags=["Insights"])


@router.get("", response_model=PaginatedInsights)
async def list_insights(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    """Get user's AI-generated insights."""
    service = InsightService(db, current_user)
    return await service.list_insights(page, per_page)


@router.post("/generate", response_model=list[InsightResponse])
async def generate_insights(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Trigger insight generation from mood data."""
    service = InsightService(db, current_user)
    insights = await service.generate_insights()
    return [InsightResponse.model_validate(i) for i in insights]


@router.get("/{insight_id}", response_model=InsightResponse)
async def get_insight(
    insight_id: UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific insight."""
    service = InsightService(db, current_user)
    return await service.get_insight(insight_id)


@router.post("/{insight_id}/feedback", status_code=status.HTTP_204_NO_CONTENT)
async def submit_insight_feedback(
    insight_id: UUID,
    feedback: InsightFeedback,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Rate an insight's helpfulness."""
    service = InsightService(db, current_user)
    await service.submit_feedback(insight_id, feedback)
    return None


@router.post("/{insight_id}/dismiss", status_code=status.HTTP_204_NO_CONTENT)
async def dismiss_insight(
    insight_id: UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Dismiss an insight."""
    service = InsightService(db, current_user)
    await service.dismiss_insight(insight_id)
    return None
```

### 13. `app/api/v1/recommendations.py`

```python
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import CurrentUser
from app.schemas.recommendation import (
    RecommendationResponse,
    RecommendationFeedback,
    PaginatedRecommendations,
)
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("", response_model=PaginatedRecommendations)
async def get_recommendations(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
):
    """Get personalized recommendations."""
    service = RecommendationService(db, current_user)
    return await service.get_recommendations(page, per_page)


@router.post("/generate", response_model=list[RecommendationResponse])
async def generate_recommendations(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Generate new recommendations based on recent mood data."""
    service = RecommendationService(db, current_user)
    from app.schemas.content import ContentBrief

    recs = await service.generate_recommendations()
    return [
        RecommendationResponse(
            id=r.id,
            content=ContentBrief.model_validate(r.content) if r.content else None,
            reason=r.reason,
            priority=r.priority,
            expires_at=r.expires_at,
            created_at=r.created_at,
        )
        for r in recs
    ]


@router.post("/{rec_id}/start", status_code=status.HTTP_204_NO_CONTENT)
async def start_recommendation(
    rec_id: UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Mark a recommendation as started."""
    service = RecommendationService(db, current_user)
    await service.mark_started(rec_id)
    return None


@router.post("/{rec_id}/complete", status_code=status.HTTP_204_NO_CONTENT)
async def complete_recommendation(
    rec_id: UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Mark a recommendation as completed."""
    service = RecommendationService(db, current_user)
    await service.mark_completed(rec_id)
    return None


@router.post("/{rec_id}/feedback", status_code=status.HTTP_204_NO_CONTENT)
async def submit_feedback(
    rec_id: UUID,
    feedback: RecommendationFeedback,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Submit feedback on a recommendation."""
    service = RecommendationService(db, current_user)
    await service.submit_feedback(rec_id, feedback)
    return None
```

### 14. `app/api/v1/content.py`

```python
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import CurrentUser
from app.schemas.content import ContentBrief, ContentDetail, PaginatedContent
from app.services.content_service import ContentService

router = APIRouter(prefix="/content", tags=["Content Library"])


@router.get("", response_model=PaginatedContent)
async def list_content(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    content_type: str | None = None,
    mood: str | None = None,
    difficulty: str | None = None,
    is_premium: bool | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    """Browse content library."""
    service = ContentService(db, current_user)
    return await service.list_content(
        content_type=content_type,
        mood=mood,
        difficulty=difficulty,
        is_premium=is_premium,
        page=page,
        per_page=per_page,
    )


@router.get("/{content_id}", response_model=ContentDetail)
async def get_content(
    content_id: UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Get content details."""
    service = ContentService(db, current_user)
    return await service.get_content(content_id)
```

### 15. Update `app/api/v1/router.py`

```python
from app.api.v1 import auth, mood, journal, chat, crisis, insights, recommendations, content

api_router = APIRouter()

api_router.include_router(auth.router)            # Agent 1
api_router.include_router(mood.router)            # Agent 2
api_router.include_router(journal.router)         # Agent 2
api_router.include_router(chat.router)            # Agent 3
api_router.include_router(crisis.router)          # Agent 3
api_router.include_router(insights.router)        # Agent 4
api_router.include_router(recommendations.router) # Agent 4
api_router.include_router(content.router)         # Agent 4
```

---

## Migration Script

Create `alembic/versions/004_insights_content_tables.py`:

```python
"""Add insights, recommendations, and content library tables

Revision ID: 004
Revises: 003
Create Date: 2026-02-02
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = '004'
down_revision = '003'


def upgrade() -> None:
    # Content library
    op.create_table(
        'content_library',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('content_type', sa.String(30), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('content_body', sa.Text(), nullable=True),
        sa.Column('duration_minutes', sa.SmallInteger(), nullable=True),
        sa.Column('difficulty', sa.String(20), nullable=True),
        sa.Column('instructions', JSONB(), nullable=True),
        sa.Column('target_moods', JSONB(), nullable=True),
        sa.Column('target_factors', JSONB(), nullable=True),
        sa.Column('audio_url', sa.String(500), nullable=True),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('is_premium', sa.Boolean(), default=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('view_count', sa.Integer(), default=0),
        sa.Column('avg_rating', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
    )

    # User insights
    op.create_table(
        'user_insights',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('user_id', UUID(), nullable=False),
        sa.Column('insight_type', sa.String(30), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('data_points', JSONB(), nullable=True),
        sa.Column('data_visualization', JSONB(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('shown_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('dismissed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('helpful_rating', sa.SmallInteger(), nullable=True),
        sa.Column('valid_from', sa.DateTime(timezone=True), nullable=False),
        sa.Column('valid_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_user_insights_user_id', 'user_insights', ['user_id'])

    # Recommendations
    op.create_table(
        'recommendations',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('user_id', UUID(), nullable=False),
        sa.Column('insight_id', UUID(), nullable=True),
        sa.Column('content_id', UUID(), nullable=False),
        sa.Column('reason', sa.String(500), nullable=True),
        sa.Column('priority', sa.SmallInteger(), default=5),
        sa.Column('shown_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('clicked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('feedback', sa.String(20), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['insight_id'], ['user_insights.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['content_id'], ['content_library.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_recommendations_user_id', 'recommendations', ['user_id'])


def downgrade() -> None:
    op.drop_table('recommendations')
    op.drop_table('user_insights')
    op.drop_table('content_library')
```

---

## Seed Content Library

Create `scripts/seed_content.py`:

```python
import asyncio
from app.database import AsyncSessionLocal
from app.models.content import ContentLibrary


CONTENT_ITEMS = [
    {
        "content_type": "breathing",
        "title": "4-7-8 Calming Breath",
        "description": "A simple breathing technique to activate your relaxation response.",
        "duration_minutes": 3,
        "difficulty": "beginner",
        "instructions": [
            "Find a comfortable seated position",
            "Breathe in quietly through your nose for 4 seconds",
            "Hold your breath for 7 seconds",
            "Exhale completely through your mouth for 8 seconds",
            "Repeat 3-4 times"
        ],
        "target_moods": ["anxious", "stressed", "general"],
        "is_premium": False,
    },
    {
        "content_type": "breathing",
        "title": "Box Breathing",
        "description": "Used by Navy SEALs to stay calm under pressure.",
        "duration_minutes": 5,
        "difficulty": "beginner",
        "instructions": [
            "Inhale for 4 seconds",
            "Hold for 4 seconds",
            "Exhale for 4 seconds",
            "Hold for 4 seconds",
            "Repeat for 5 minutes"
        ],
        "target_moods": ["anxious", "stressed"],
        "is_premium": False,
    },
    {
        "content_type": "grounding",
        "title": "5-4-3-2-1 Grounding",
        "description": "Reconnect with the present moment using your five senses.",
        "duration_minutes": 5,
        "difficulty": "beginner",
        "instructions": [
            "Name 5 things you can SEE",
            "Name 4 things you can TOUCH",
            "Name 3 things you can HEAR",
            "Name 2 things you can SMELL",
            "Name 1 thing you can TASTE"
        ],
        "target_moods": ["anxious", "overwhelmed", "dissociated"],
        "is_premium": False,
    },
    {
        "content_type": "meditation",
        "title": "Body Scan Relaxation",
        "description": "Progressively relax each part of your body from head to toe.",
        "duration_minutes": 10,
        "difficulty": "beginner",
        "target_moods": ["stressed", "tense", "insomnia"],
        "is_premium": False,
    },
    {
        "content_type": "meditation",
        "title": "Loving-Kindness Meditation",
        "description": "Cultivate compassion for yourself and others.",
        "duration_minutes": 15,
        "difficulty": "intermediate",
        "target_moods": ["sad", "lonely", "self-critical"],
        "is_premium": True,
    },
    {
        "content_type": "tip",
        "title": "Morning Mood Boost",
        "description": "Start your day with these quick mood-boosting activities.",
        "content_body": """
## Quick Morning Wins

1. **Hydrate immediately** - Drink a full glass of water before coffee
2. **5 minutes of movement** - Stretching, dancing, or a short walk
3. **Gratitude moment** - Name 3 things you're grateful for today
4. **Natural light** - Open curtains or step outside for 2 minutes

These simple habits can significantly improve your morning mood!
        """,
        "target_moods": ["low", "tired", "general"],
        "is_premium": False,
    },
    {
        "content_type": "tip",
        "title": "Anxiety First Aid",
        "description": "Quick techniques for when anxiety spikes.",
        "content_body": """
## When Anxiety Hits

1. **Ground yourself** - Plant your feet firmly, feel the floor
2. **Name it** - "I notice I'm feeling anxious right now"
3. **Cool down** - Splash cold water on your face or hold ice
4. **Breathe slow** - Make your exhale longer than your inhale
5. **Move** - Walk, stretch, or shake out your hands

Remember: This feeling is temporary. You've gotten through anxiety before.
        """,
        "target_moods": ["anxious", "panic"],
        "is_premium": False,
    },
]


async def seed():
    async with AsyncSessionLocal() as db:
        for data in CONTENT_ITEMS:
            content = ContentLibrary(**data)
            db.add(content)
        await db.commit()
        print(f"Seeded {len(CONTENT_ITEMS)} content items")


if __name__ == "__main__":
    asyncio.run(seed())
```

---

## Checklist

- [ ] Models created with proper relationships
- [ ] Pattern detector works with sample data
- [ ] Prophet trend detection runs without errors
- [ ] Content library seeds successfully
- [ ] Insights generate from mood data
- [ ] Recommendations personalize based on mood
- [ ] All CRUD endpoints work
- [ ] Migration applies cleanly
- [ ] Tests pass

---

## Coordination Notes

- **Agent 2**: Call `service.generate_insights()` after user has 14+ mood logs
- **Agent 3**: Insights can use crisis events to provide "seek help" insights
- **All Agents**: Ensure `app/models/__init__.py` exports all models for Alembic
