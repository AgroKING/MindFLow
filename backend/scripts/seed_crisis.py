import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.models.crisis import CrisisResource


CRISIS_RESOURCES = [
    {
        "name": "988 Suicide & Crisis Lifeline",
        "description": "Free, 24/7 support for people in distress. Call or text 988.",
        "resource_type": "hotline",
        "phone_number": "988",
        "sms_number": "988",
        "website_url": "https://988lifeline.org",
        "available_24_7": True,
        "countries": ["US"],
        "languages": ["en", "es"],
        "priority": 10,
    },
    {
        "name": "Crisis Text Line",
        "description": "Text HOME to 741741 to connect with a trained crisis counselor.",
        "resource_type": "text_line",
        "sms_number": "741741",
        "website_url": "https://www.crisistextline.org",
        "available_24_7": True,
        "countries": ["US"],
        "languages": ["en"],
        "priority": 9,
    },
    {
        "name": "SAMHSA National Helpline",
        "description": "Treatment referrals and information for mental health and substance use.",
        "resource_type": "hotline",
        "phone_number": "1-800-662-4357",
        "website_url": "https://www.samhsa.gov/find-help/national-helpline",
        "available_24_7": True,
        "countries": ["US"],
        "languages": ["en", "es"],
        "priority": 8,
    },
]


async def seed():
    async with AsyncSessionLocal() as db:
        for data in CRISIS_RESOURCES:
            resource = CrisisResource(**data)
            db.add(resource)
        await db.commit()
        print(f"Seeded {len(CRISIS_RESOURCES)} crisis resources")


if __name__ == "__main__":
    asyncio.run(seed())
