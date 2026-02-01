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
