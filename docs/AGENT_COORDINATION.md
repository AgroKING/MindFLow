# Multi-Agent Development Coordination Guide

## Agent Overview

| Agent | Domain | Key Files | Dependencies |
|-------|--------|-----------|--------------|
| **Agent 1** | Foundation & Auth | database, models/base, users, auth | None (starts first) |
| **Agent 2** | Mood & Journal | mood, journal, encryption | Agent 1 |
| **Agent 3** | Chat & AI | chat, crisis, gemini, sentiment | Agent 1 |
| **Agent 4** | Insights & Content | insights, recommendations, patterns | Agent 1, Agent 2 data |

---

## Execution Timeline

```
Week 1-3: Agent 1 works alone (Foundation)
         ├─ Project setup, Docker, database
         ├─ SQLAlchemy models, Alembic
         └─ JWT auth, user CRUD

Week 3-6: Agents 2, 3, 4 work in parallel
         Agent 2: Mood logs, encrypted journals
         Agent 3: Chat system, Gemini integration
         Agent 4: Content library, pattern detection

Week 5+:  Integration begins
         └─ Agent 3 sentiment used by Agent 2
         └─ Agent 2 mood data used by Agent 4
```

---

## Shared Files

All agents modify these files. Coordinate additions:

### `app/api/v1/router.py`
```python
# Add imports and includes in order:
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

### `app/models/__init__.py`
```python
# Export all models for Alembic
from app.models.base import Base, BaseModel
from app.models.user import User, UserConsent, OAuthConnection  # Agent 1
from app.models.mood import MoodLog, MoodFactor                  # Agent 2
from app.models.journal import JournalEntry                       # Agent 2
from app.models.chat import ChatSession, ChatMessage              # Agent 3
from app.models.crisis import CrisisEvent, CrisisResource         # Agent 3
from app.models.content import ContentLibrary                     # Agent 4
from app.models.insight import UserInsight                        # Agent 4
from app.models.recommendation import Recommendation              # Agent 4
```

### `requirements.txt`
Each agent adds their dependencies. Merge in order:
- Agent 1: Base deps (fastapi, sqlalchemy, pyjwt, etc.)
- Agent 2: cryptography, pandas
- Agent 3: google-genai, transformers, torch, pgvector
- Agent 4: prophet, scikit-learn

---

## Migration Order

Migrations must be applied sequentially:

1. `001_users_auth.py` → Agent 1
2. `002_mood_journal_tables.py` → Agent 2
3. `003_chat_crisis_tables.py` → Agent 3
4. `004_insights_content_tables.py` → Agent 4

---

## Cross-Agent Integration Points

### Agent 3 → Agent 2 (Sentiment)
Agent 2 should import and use Agent 3's sentiment analyzer:

```python
# In mood_service.py
from app.ml.sentiment import sentiment_analyzer

async def create_log(self, data):
    # ... create log ...
    if data.note:
        result = await sentiment_analyzer.analyze(data.note)
        log.note_sentiment = result["score"]
```

### Agent 2 → Agent 4 (Mood Data)
Agent 4 reads Agent 2's mood logs for pattern detection:

```python
# In insight_service.py
from app.models.mood import MoodLog

async def generate_insights(self):
    logs = await self.db.execute(
        select(MoodLog).where(MoodLog.user_id == self.user.id)
    )
```

---

## Testing Strategy

Each agent tests their own domain:
- `tests/test_auth.py` → Agent 1
- `tests/test_mood.py`, `tests/test_journal.py` → Agent 2
- `tests/test_chat.py`, `tests/test_crisis.py` → Agent 3
- `tests/test_insights.py`, `tests/test_recommendations.py` → Agent 4

Integration tests require Agent 1's fixtures from `conftest.py`.

---

## Prompt File Locations

| Agent | Prompt File |
|-------|------------|
| Agent 1 | `docs/AGENT_1_FOUNDATION_AUTH.md` |
| Agent 2 | `docs/AGENT_2_MOOD_JOURNAL.md` |
| Agent 3 | `docs/AGENT_3_CHAT_AI.md` |
| Agent 4 | `docs/AGENT_4_INSIGHTS_CONTENT.md` |

---

## Quick Start Commands

```bash
# Agent 1: Start here
docker-compose up -d db redis
python -m alembic upgrade head
uvicorn app.main:app --reload

# All agents: Run tests
pytest tests/ -v

# Seed data (Agents 3 & 4)
python scripts/seed_crisis.py
python scripts/seed_content.py
```
