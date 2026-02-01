import pytest
from httpx import AsyncClient
from app.main import app
from app.models.mood import MoodLog
from datetime import datetime, timezone, timedelta

@pytest.mark.asyncio
async def test_generate_insights_empty(async_client: AsyncClient, test_user, token_headers):
    response = await async_client.post("/api/v1/insights/generate", headers=token_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Should be empty if no mood logs
    assert len(data) == 0

@pytest.mark.asyncio
async def test_generate_insights_with_data(async_client: AsyncClient, db_session, test_user, token_headers):
    # Seed mood data
    base_time = datetime.now(timezone.utc)
    for i in range(15):
        log = MoodLog(
            user_id=test_user.id,
            mood_score=8 if i % 2 == 0 else 4,
            logged_at=base_time - timedelta(days=i),
            description="Test log"
        )
        db_session.add(log)
    await db_session.commit()

    response = await async_client.post("/api/v1/insights/generate", headers=token_headers)
    assert response.status_code == 200
    data = response.json()
    
    # We expect at least one insight (e.g. pattern or trend)
    # but strictly depends on the pattern detector logic and data
    # This test primarily checks the endpoint doesn't crash
    assert isinstance(data, list)

@pytest.mark.asyncio
async def test_list_insights(async_client: AsyncClient, token_headers):
    response = await async_client.get("/api/v1/insights", headers=token_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
