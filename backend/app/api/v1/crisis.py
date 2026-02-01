from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import CurrentUser
from app.schemas.crisis import (
    CrisisResource,
    CrisisSelfCheck,
    CrisisCheckResponse,
)
from app.services.crisis_service import CrisisService

router = APIRouter(prefix="/crisis", tags=["Crisis Support"])


@router.get("/resources", response_model=list[CrisisResource])
async def get_crisis_resources(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    country: str = "US",
    language: str = "en",
):
    """Get crisis support resources."""
    service = CrisisService(db, current_user)
    resources = await service.get_resources(country, language)
    return resources


@router.post("/check", response_model=CrisisCheckResponse)
async def crisis_self_check(
    data: CrisisSelfCheck,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Manual crisis self-assessment."""
    service = CrisisService(db, current_user)

    # Calculate risk level based on responses
    critical_flags = [data.thoughts_of_suicide, data.thoughts_of_self_harm]
    high_flags = [data.feeling_hopeless, data.feeling_trapped]

    if any(critical_flags):
        risk_level = "critical"
        message = "Your safety is the priority right now. Please reach out to a crisis counselor."
    elif all(high_flags):
        risk_level = "high"
        message = "It sounds like you're going through a really difficult time. Support is available."
    elif any(high_flags) or data.increased_substance_use:
        risk_level = "medium"
        message = "Thank you for sharing. Consider talking to someone about how you're feeling."
    else:
        risk_level = "low"
        message = "It's good that you checked in. Remember, support is always available if you need it."

    # Log the check
    await service.handle_detection(
        source="manual",
        severity=risk_level,
        confidence=1.0,
    )

    resources = await service.get_resources()

    return CrisisCheckResponse(
        risk_level=risk_level,
        message=message,
        resources=resources[:5],
        professional_referral_suggested=risk_level in ["high", "critical"],
    )


@router.post("/events/{event_id}/resource-clicked", status_code=status.HTTP_204_NO_CONTENT)
async def log_resource_click(
    event_id: UUID,
    resource_id: str,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Log when user clicks a crisis resource."""
    service = CrisisService(db, current_user)
    await service.log_resource_click(event_id, resource_id)
    return None
