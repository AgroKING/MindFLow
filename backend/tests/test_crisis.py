import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_get_crisis_resources(client: AsyncClient, token_headers: dict):
    # Need to seed resources first or mock them. 
    # Assuming resources are present or empty list returned.
    response = await client.get("/api/v1/crisis/resources", headers=token_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


async def test_crisis_self_check_low(client: AsyncClient, token_headers: dict):
    response = await client.post(
        "/api/v1/crisis/check",
        headers=token_headers,
        json={
            "feeling_hopeless": False,
            "thoughts_of_self_harm": False
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "low"


async def test_crisis_self_check_critical(client: AsyncClient, token_headers: dict):
    response = await client.post(
        "/api/v1/crisis/check",
        headers=token_headers,
        json={
            "feeling_hopeless": True,
            "thoughts_of_suicide": True
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "critical"
    assert data["professional_referral_suggested"] is True
