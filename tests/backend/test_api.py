"""
Integration and End-to-End Tests for FastAPI Endpoints.
"""

import pytest
from httpx import ASGITransport, AsyncClient
from backend.app.main import app
from backend.app.models.contracts import SessionStatus


@pytest.mark.asyncio
async def test_health_check_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["version"] == "1.0.0"


@pytest.mark.asyncio
async def test_create_and_get_research_session():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "query": "Is artificial intelligence replacing software developers, or is it increasing developer productivity?",
            "domain": "technology",
            "research_depth": "brief",
            "maximum_sources": 4
        }
        create_res = await client.post("/api/research", json=payload)
        assert create_res.status_code == 201
        session_data = create_res.json()
        session_id = session_data["session_id"]
        assert session_id is not None
        assert session_data["status"] == SessionStatus.QUEUED

        # Retrieve session
        get_res = await client.get(f"/api/research/{session_id}")
        assert get_res.status_code == 200
        assert get_res.json()["session_id"] == session_id


@pytest.mark.asyncio
async def test_nonexistent_session_returns_404():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/research/non-existent-session-id")
        assert res.status_code == 404


@pytest.mark.asyncio
async def test_cancel_session_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {"query": "Test cancellation workflow behavior"}
        create_res = await client.post("/api/research", json=payload)
        session_id = create_res.json()["session_id"]

        cancel_res = await client.post(f"/api/research/{session_id}/cancel")
        assert cancel_res.status_code == 200
        assert cancel_res.json()["status"] == "cancelled"


@pytest.mark.asyncio
async def test_root_spa_or_info_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/")
        assert res.status_code == 200
