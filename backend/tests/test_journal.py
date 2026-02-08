import pytest
from httpx import AsyncClient
from app.models.journal import JournalEntry
from sqlalchemy import select

@pytest.mark.asyncio
async def test_create_journal_entry(client: AsyncClient, normal_user_token_headers):
    data = {
        "content": "This is a secret journal entry.",
        "entry_type": "freeform"
    }
    response = await client.post("/api/v1/journal/entries", json=data, headers=normal_user_token_headers)
    assert response.status_code == 201
    content = response.json()
    assert content["entry_type"] == "freeform"
    assert "content" not in content # Response model excludes content unless detail view? 
    # Wait, create response uses JournalEntryResponse which DOES NOT have content. 
    # Correct.

@pytest.mark.asyncio
async def test_get_journal_entry_decrypted(client: AsyncClient, normal_user_token_headers):
    # Create
    create_res = await client.post(
        "/api/v1/journal/entries", 
        json={"content": "Secret content", "entry_type": "freeform"}, 
        headers=normal_user_token_headers
    )
    entry_id = create_res.json()["id"]

    # Get
    response = await client.get(f"/api/v1/journal/entries/{entry_id}", headers=normal_user_token_headers)
    assert response.status_code == 200
    content = response.json()
    assert content["content"] == "Secret content"

@pytest.mark.asyncio
async def test_list_journal_entries(client: AsyncClient, normal_user_token_headers):
    await client.post("/api/v1/journal/entries", json={"content": "Note 1"}, headers=normal_user_token_headers)
    await client.post("/api/v1/journal/entries", json={"content": "Note 2"}, headers=normal_user_token_headers)

    response = await client.get("/api/v1/journal/entries", headers=normal_user_token_headers)
    assert response.status_code == 200
    content = response.json()
    assert "items" in content
    assert content["total"] >= 2
