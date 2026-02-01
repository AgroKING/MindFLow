from datetime import datetime, timezone, timedelta
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
import math

from app.models.mood import MoodLog, MoodFactor
from app.models.user import User
from app.schemas.mood import (
    MoodLogCreate,
    MoodLogUpdate,
    MoodLogResponse,
    PaginatedMoodLogs,
    MoodStatsResponse,
    MoodTrendsResponse,
    MoodTrendPoint,
)
from app.utils.exceptions import NotFoundException, ForbiddenException


class MoodService:
    def __init__(self, db: AsyncSession, current_user: User):
        self.db = db
        self.user = current_user

    def _get_time_of_day(self, dt: datetime) -> str:
        hour = dt.hour
        if 5 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 21:
            return "evening"
        else:
            return "night"

    async def create_log(self, data: MoodLogCreate) -> MoodLog:
        logged_at = data.logged_at or datetime.now(timezone.utc)

        log = MoodLog(
            user_id=self.user.id,
            mood_score=data.mood_score,
            energy_level=data.energy_level,
            anxiety_level=data.anxiety_level,
            note=data.note,
            logged_at=logged_at,
            time_of_day=self._get_time_of_day(logged_at),
            day_of_week=logged_at.weekday(),
            location_type=data.location_type,
        )

        # Add factors
        if data.factors:
            for factor_data in data.factors:
                factor = MoodFactor(
                    factor_type=factor_data.factor_type,
                    factor_value=factor_data.factor_value,
                    impact_score=factor_data.impact_score,
                )
                log.factors.append(factor)

        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def get_log(self, log_id: UUID) -> MoodLog:
        result = await self.db.execute(
            select(MoodLog)
            .options(selectinload(MoodLog.factors))
            .where(MoodLog.id == log_id)
        )
        log = result.scalar_one_or_none()

        if not log:
            raise NotFoundException("Mood log not found")
        if log.user_id != self.user.id:
            raise ForbiddenException("Not authorized to access this log")

        return log

    async def list_logs(
        self,
        page: int = 1,
        per_page: int = 20,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> PaginatedMoodLogs:
        query = (
            select(MoodLog)
            .options(selectinload(MoodLog.factors))
            .where(MoodLog.user_id == self.user.id)
            .order_by(MoodLog.logged_at.desc())
        )

        if start_date:
            query = query.where(MoodLog.logged_at >= start_date)
        if end_date:
            query = query.where(MoodLog.logged_at <= end_date)

        # Count total
        count_query = select(func.count(MoodLog.id)).where(MoodLog.user_id == self.user.id)
        if start_date:
            count_query = count_query.where(MoodLog.logged_at >= start_date)
        if end_date:
            count_query = count_query.where(MoodLog.logged_at <= end_date)

        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Paginate
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)

        result = await self.db.execute(query)
        logs = result.scalars().all()

        return PaginatedMoodLogs(
            items=[MoodLogResponse.model_validate(log) for log in logs],
            total=total,
            page=page,
            per_page=per_page,
            pages=math.ceil(total / per_page) if total > 0 else 1,
        )

    async def update_log(self, log_id: UUID, data: MoodLogUpdate) -> MoodLog:
        log = await self.get_log(log_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(log, field, value)

        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def delete_log(self, log_id: UUID) -> None:
        log = await self.get_log(log_id)
        await self.db.delete(log)
        await self.db.commit()

    async def get_stats(self, period: str = "30d") -> MoodStatsResponse:
        days_map = {"7d": 7, "30d": 30, "90d": 90}
        days = days_map.get(period, 30)

        start_date = datetime.now(timezone.utc) - timedelta(days=days)

        query = select(MoodLog).where(
            MoodLog.user_id == self.user.id,
            MoodLog.logged_at >= start_date,
        )
        result = await self.db.execute(query)
        logs = result.scalars().all()

        if not logs:
            return MoodStatsResponse(
                period=period,
                avg_mood=0,
                avg_energy=None,
                avg_anxiety=None,
                mood_trend="stable",
                best_day=None,
                worst_day=None,
                total_logs=0,
                streak_days=0,
            )

        # Calculate averages
        avg_mood = sum(log.mood_score for log in logs) / len(logs)
        energy_values = [log.energy_level for log in logs if log.energy_level]
        anxiety_values = [log.anxiety_level for log in logs if log.anxiety_level]

        avg_energy = sum(energy_values) / len(energy_values) if energy_values else None
        avg_anxiety = sum(anxiety_values) / len(anxiety_values) if anxiety_values else None

        # Day analysis
        day_scores: dict[int, list[int]] = {}
        for log in logs:
            day = log.day_of_week
            if day is not None:
                day_scores.setdefault(day, []).append(log.mood_score)

        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        best_day = None
        worst_day = None

        if day_scores:
            day_avgs = {d: sum(s) / len(s) for d, s in day_scores.items()}
            best_day = day_names[max(day_avgs, key=day_avgs.get)]
            worst_day = day_names[min(day_avgs, key=day_avgs.get)]

        # Trend calculation (simple: compare first half to second half)
        mid = len(logs) // 2
        if mid > 0:
            first_half_avg = sum(log.mood_score for log in logs[mid:]) / len(logs[mid:])
            second_half_avg = sum(log.mood_score for log in logs[:mid]) / mid
            diff = second_half_avg - first_half_avg
            trend = "improving" if diff > 0.5 else "declining" if diff < -0.5 else "stable"
        else:
            trend = "stable"

        # Streak calculation
        streak = await self._calculate_streak()

        return MoodStatsResponse(
            period=period,
            avg_mood=round(avg_mood, 2),
            avg_energy=round(avg_energy, 2) if avg_energy else None,
            avg_anxiety=round(avg_anxiety, 2) if avg_anxiety else None,
            mood_trend=trend,
            best_day=best_day,
            worst_day=worst_day,
            total_logs=len(logs),
            streak_days=streak,
        )

    async def _calculate_streak(self) -> int:
        """Calculate consecutive days with mood logs."""
        today = datetime.now(timezone.utc).date()
        streak = 0

        for i in range(365):  # Max 1 year lookback
            check_date = today - timedelta(days=i)
            # Casting logged_at to date. Depending on DB dialect this might need ajustment.
            # Postgres: func.date(...) works
            result = await self.db.execute(
                select(func.count(MoodLog.id)).where(
                    MoodLog.user_id == self.user.id,
                    func.date(MoodLog.logged_at) == check_date,
                )
            )
            count = result.scalar()
            if count > 0:
                streak += 1
            else:
                # If today has no logs, don't break immediately if counting from yesterday? 
                # Usually streak includes today if logged, or continues from yesterday.
                # If check_date is today and count is 0, streak is still potentially valid from yesterday?
                # But simple logic: if day i (today) is 0, streak is 0? Or do we allow missing today?
                # Let's assume strict streak for now.
                if i == 0 and count == 0:
                    continue # Try yesterday
                else: 
                     # If previous day (i>0) is missing, streak breaks
                    if i > 0:
                         break
                    # If i==0 and we continued, effectively we are just skipping today.
                    # But wait, if we skip today, streak starts from yesterday. 
                    
        # Retrying logic to be safer:
        # Check today. If yes, streak starts at 1. Then check yesterday.
        # If no, check yesterday. If yes, streak starts at 1.
        # This implementation above is a bit ambiguous. Let's stick to the one provided or make it robust.
        # Re-reading doc: "Consecutive days with logs".
        pass 
        # Actually, let's just stick to the doc implementation or simple correct one.
        # Creating a more robust loop.
        
        current_date_check = today
        current_streak = 0
        
        # Check today first
        result = await self.db.execute(
            select(func.count(MoodLog.id)).where(
                 MoodLog.user_id == self.user.id,
                 func.date(MoodLog.logged_at) == current_date_check
            )
        )
        if result.scalar() > 0:
             current_streak += 1
        
        # Check previous days
        for i in range(1, 365):
             prev_date = today - timedelta(days=i)
             result = await self.db.execute(
                select(func.count(MoodLog.id)).where(
                     MoodLog.user_id == self.user.id,
                     func.date(MoodLog.logged_at) == prev_date
                )
             )
             if result.scalar() > 0:
                 current_streak += 1
             else:
                 # If today was missing, we can still have a streak from yesterday?
                 # Example: logged yesterday (1), today not yet (0). Streak is 1.
                 # If current_streak is 0 (today empty), and yesterday is empty, streak 0.
                 # If current_streak is 0 (today empty), and yesterday has log, streak 1.
                 if i == 1 and current_streak == 0:
                      # If today missed, but yesterday hit, we allow it? 
                      # Usually "current streak" implies active. If I didn't log today, my streak might be at risk but valid.
                      pass 
                 else:
                      break
        return current_streak


    async def get_trends(self, period: str = "30d") -> MoodTrendsResponse:
        days_map = {"7d": 7, "30d": 30, "90d": 90}
        days = days_map.get(period, 30)

        start_date = datetime.now(timezone.utc) - timedelta(days=days)

        query = (
            select(
                func.date(MoodLog.logged_at).label("date"),
                func.avg(MoodLog.mood_score).label("avg_mood"),
                func.count(MoodLog.id).label("log_count"),
            )
            .where(
                MoodLog.user_id == self.user.id,
                MoodLog.logged_at >= start_date,
            )
            .group_by(func.date(MoodLog.logged_at))
            .order_by(func.date(MoodLog.logged_at))
        )

        result = await self.db.execute(query)
        rows = result.all()

        data_points = [
            MoodTrendPoint(date=row.date, avg_mood=round(row.avg_mood, 2), log_count=row.log_count)
            for row in rows
        ]

        # Calculate overall trend (simple linear regression slope)
        if len(data_points) >= 2:
            n = len(data_points)
            x_sum = sum(range(n))
            y_sum = sum(p.avg_mood for p in data_points)
            xy_sum = sum(i * p.avg_mood for i, p in enumerate(data_points))
            x2_sum = sum(i * i for i in range(n))

            denom = (n * x2_sum - x_sum * x_sum)
            if denom == 0:
                slope = 0
            else:
                slope = (n * xy_sum - x_sum * y_sum) / denom
        else:
            slope = 0

        return MoodTrendsResponse(
            period=period,
            data_points=data_points,
            overall_trend=round(slope, 4),
        )
