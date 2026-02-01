from datetime import datetime
from uuid import UUID
from typing import Literal
from pydantic import BaseModel, Field


class CrisisResource(BaseModel):
    id: UUID
    name: str
    description: str | None
    resource_type: Literal["hotline", "text_line", "website", "app"]
    phone_number: str | None
    sms_number: str | None
    website_url: str | None
    available_24_7: bool

    class Config:
        from_attributes = True


class CrisisSelfCheck(BaseModel):
    feeling_hopeless: bool = False
    thoughts_of_self_harm: bool = False
    thoughts_of_suicide: bool = False
    feeling_trapped: bool = False
    increased_substance_use: bool = False


class CrisisCheckResponse(BaseModel):
    risk_level: Literal["low", "medium", "high", "critical"]
    message: str
    resources: list[CrisisResource]
    professional_referral_suggested: bool


class SafetyContact(BaseModel):
    name: str
    relationship: str
    phone: str | None = None
    can_call_anytime: bool = False


class SafetyPlan(BaseModel):
    warning_signs: list[str] = Field(default_factory=list)
    coping_strategies: list[str] = Field(default_factory=list)
    social_contacts: list[SafetyContact] = Field(default_factory=list)
    professional_contacts: list[SafetyContact] = Field(default_factory=list)
    environment_safety_steps: list[str] = Field(default_factory=list)
    reasons_for_living: list[str] = Field(default_factory=list)


class SafetyPlanUpdate(BaseModel):
    warning_signs: list[str] | None = None
    coping_strategies: list[str] | None = None
    social_contacts: list[SafetyContact] | None = None
    professional_contacts: list[SafetyContact] | None = None
    environment_safety_steps: list[str] | None = None
    reasons_for_living: list[str] | None = None
