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
