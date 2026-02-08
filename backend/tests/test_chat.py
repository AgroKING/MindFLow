import pytest
from uuid import uuid4
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.chat import ChatSession

pytestmark = pytest.mark.asyncio


async def test_create_chat_session(client: AsyncClient, token_headers: dict):
    response = await client.post(
        "/api/v1/chat/sessions",
        headers=token_headers,
        json={"session_type": "general", "initial_message": "Hello"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["session_type"] == "general"
    assert "id" in data
    # Initial message should trigger create
    assert data["message_count"] == 2  # User msg + AI response


async def test_list_sessions(client: AsyncClient, token_headers: dict):
    # Create two sessions
    await client.post("/api/v1/chat/sessions", headers=token_headers, json={})
    await client.post("/api/v1/chat/sessions", headers=token_headers, json={})

    response = await client.get("/api/v1/chat/sessions", headers=token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert len(data["items"]) >= 2


async def test_send_message(client: AsyncClient, token_headers: dict):
    # Create session
    r = await client.post("/api/v1/chat/sessions", headers=token_headers, json={})
    session_id = r.json()["id"]

    # Send message
    response = await client.post(
        f"/api/v1/chat/sessions/{session_id}/messages",
        headers=token_headers,
        json={"content": "I am feeling a bit anxious today"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"]["role"] == "assistant"
    assert data["message"]["content"]
    assert "suggestions" in data


async def test_crisis_detection_in_chat(client: AsyncClient, token_headers: dict):
    # Create session
    r = await client.post("/api/v1/chat/sessions", headers=token_headers, json={})
    session_id = r.json()["id"]

    # Send crisis message
    response = await client.post(
        f"/api/v1/chat/sessions/{session_id}/messages",
        headers=token_headers,
        json={"content": "I want to kill myself"}
    )
    assert response.status_code == 200
    data = response.json()
    
    # Check crisis alert
    assert data["crisis_alert"] is not None
    assert data["crisis_alert"]["severity"] in ["high", "critical"]
    assert len(data["crisis_alert"]["resources"]) > 0
