import pytest
from httpx import AsyncClient
from app.main import app
from app.models.content import ContentLibrary

@pytest.mark.asyncio
async def test_content_lifecycle(async_client: AsyncClient, db_session, test_user, token_headers):
    # Seed content
    content = ContentLibrary(
        content_type="meditation",
        title="Test Meditation",
        description="Relaxing stuff",
        is_active=True
    )
    db_session.add(content)
    await db_session.commit()

    # List content
    response = await async_client.get("/api/v1/content", headers=token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    item = data["items"][0]
    assert item["title"] == "Test Meditation"

    # Get specific content
    response = await async_client.get(f"/api/v1/content/{item['id']}", headers=token_headers)
    assert response.status_code == 200
    assert response.json()["title"] == "Test Meditation"

@pytest.mark.asyncio
async def test_generate_recommendations(async_client: AsyncClient, db_session, test_user, token_headers):
    # Ensure some content exists
    content = ContentLibrary(
        content_type="tip",
        title="Daily Tip",
        is_active=True
    )
    db_session.add(content)
    await db_session.commit()

    response = await async_client.get("/api/v1/recommendations/daily", headers=token_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "content" in data[0]
