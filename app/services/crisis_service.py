from datetime import datetime, timezone
from uuid import UUID
import hashlib
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.crisis import CrisisEvent, CrisisResource
from app.models.user import User
from app.schemas.chat import CrisisAlert, CrisisResourceBrief
from app.schemas.crisis import SafetyPlan, SafetyPlanUpdate
import logging

logger = logging.getLogger(__name__)


class CrisisService:
    def __init__(self, db: AsyncSession, current_user: User):
        self.db = db
        self.user = current_user

    async def handle_detection(
        self,
        source: str,
        severity: str,
        confidence: float = 0.0,
        content_hash: str | None = None,
    ) -> CrisisEvent:
        """Log a crisis detection event."""
        event = CrisisEvent(
            user_id=self.user.id,
            trigger_source=source,
            trigger_content_hash=content_hash,
            severity=severity,
            detection_confidence=confidence,
        )
        self.db.add(event)
        await self.db.commit()
        await self.db.refresh(event)

        logger.warning(
            f"Crisis detected: user={self.user.id}, severity={severity}, source={source}"
        )

        return event

    async def get_resources(self, country: str = "US", language: str = "en") -> list[CrisisResource]:
        """Get relevant crisis resources."""
        query = (
            select(CrisisResource)
            .where(CrisisResource.is_active == True)
            .order_by(CrisisResource.priority.desc())
        )

        result = await self.db.execute(query)
        resources = result.scalars().all()

        # Filter by country/language if specified
        filtered = []
        for r in resources:
            countries = r.countries or ["US"]
            languages = r.languages or ["en"]
            if country in countries or "ALL" in countries:
                if language in languages or "ALL" in languages:
                    filtered.append(r)

        return filtered[:10]

    async def build_crisis_alert(self, severity: str) -> CrisisAlert:
        """Build crisis alert with resources."""
        resources = await self.get_resources()

        messages = {
            "low": "I noticed some concerning language. Would you like to talk about what's going on?",
            "medium": "I'm concerned about what you shared. You don't have to go through this alone.",
            "high": "I hear you, and I'm worried about you. Let's connect you with support.",
            "critical": "Your safety matters. Please reach out to one of these resources right now.",
        }

        return CrisisAlert(
            severity=severity,
            message=messages.get(severity, messages["medium"]),
            resources=[
                CrisisResourceBrief(
                    id=r.id,
                    name=r.name,
                    phone_number=r.phone_number,
                    resource_type=r.resource_type,
                )
                for r in resources[:5]
            ],
            show_self_harm_check=severity in ["high", "critical"],
        )

    async def log_resource_click(self, event_id: UUID, resource_id: str) -> None:
        """Log when user clicks a crisis resource."""
        result = await self.db.execute(
            select(CrisisEvent).where(
                CrisisEvent.id == event_id,
                CrisisEvent.user_id == self.user.id,
            )
        )
        event = result.scalar_one_or_none()

        if event:
            event.resource_clicked = resource_id
            await self.db.commit()

    async def resolve_event(self, event_id: UUID, resolution_type: str) -> None:
        """Mark a crisis event as resolved."""
        result = await self.db.execute(
            select(CrisisEvent).where(
                CrisisEvent.id == event_id,
                CrisisEvent.user_id == self.user.id,
            )
        )
        event = result.scalar_one_or_none()

        if event:
            event.resolved_at = datetime.now(timezone.utc)
            event.resolution_type = resolution_type
            await self.db.commit()
