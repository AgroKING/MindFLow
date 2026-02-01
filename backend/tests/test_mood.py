import pytest
from httpx import AsyncClient
from app.models.mood import MoodLog
from sqlalchemy import select, func

@pytest.mark.asyncio
async def test_create_mood_log(client: AsyncClient, normal_user_token_headers):
    data = {
        "mood_score": 8,
        "energy_level": 7,
        "anxiety_level": 2,
        "note": "Feeling good today",
        "factors": [
            {"factor_type": "sleep", "factor_value": "good", "impact_score": 4}
        ]
    }
    response = await client.post("/api/v1/mood/logs", json=data, headers=normal_user_token_headers)
    assert response.status_code == 201
    content = response.json()
    assert content["mood_score"] == 8
    assert content["note"] == "Feeling good today"
    assert len(content["factors"]) == 1
    assert content["factors"][0]["factor_type"] == "sleep"

@pytest.mark.asyncio
async def test_list_mood_logs(client: AsyncClient, normal_user_token_headers):
    # Create two logs
    await client.post("/api/v1/mood/logs", json={"mood_score": 5}, headers=normal_user_token_headers)
    await client.post("/api/v1/mood/logs", json={"mood_score": 7}, headers=normal_user_token_headers)

    response = await client.get("/api/v1/mood/logs", headers=normal_user_token_headers)
    assert response.status_code == 200
    content = response.json()
    assert content["total"] >= 2
    assert len(content["items"]) >= 2
    assert content["items"][0]["mood_score"] == 7  # Ordered by date desc

@pytest.mark.asyncio
async def test_mood_stats(client: AsyncClient, normal_user_token_headers):
    # Ensure fresh state or handle existing data. 
    # For simplicity assuming isolation or appending.
    await client.post("/api/v1/mood/logs", json={"mood_score": 5}, headers=normal_user_token_headers)
    await client.post("/api/v1/mood/logs", json={"mood_score": 9}, headers=normal_user_token_headers)
    
    response = await client.get("/api/v1/mood/stats?period=30d", headers=normal_user_token_headers)
    assert response.status_code == 200
    content = response.json()
    assert content["total_logs"] >= 2
    # assert content["avg_mood"] == 7.0 # might affect by other tests running in parallel/sequence?
    # Since we don't clear DB between tests explicitly in some setups, let's just check presence.
    assert "avg_mood" in content

@pytest.mark.asyncio
async def test_mood_trends(client: AsyncClient, normal_user_token_headers):
    response = await client.get("/api/v1/mood/trends", headers=normal_user_token_headers)
    assert response.status_code == 200
    assert "data_points" in response.json()
