import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings


async def get_token_for(client: AsyncClient, email: str = "admin@gov.demo") -> str:
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": email, "password": settings.DEMO_USER_PASSWORD},
    )
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_analytics_overview():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "admin@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}
        resp = await client.get("/api/v1/analytics/overview", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        ov = data["data"]
        
        # Verify KPIs
        assert "kpis" in ov
        kpis = ov["kpis"]
        assert kpis["total_projects"] >= 1
        assert kpis["total_land_proposed_acres"] > 0
        assert kpis["total_compensation_assessed_cr"] > 0
        assert kpis["acquisition_progress_percent"] >= 0.0

        # Verify Funnel
        assert "funnel" in ov
        funnel = ov["funnel"]
        assert len(funnel["stages"]) == 8
        stage_ids = [s["stage_id"] for s in funnel["stages"]]
        assert "stage-1-proposal" in stage_ids
        assert "stage-2-proposed-land" in stage_ids
        assert "stage-6-disbursed" in stage_ids
        assert "stage-7-possession" in stage_ids

        # Verify Data Quality
        assert "data_quality_summary" in ov
        dq = ov["data_quality_summary"]
        assert dq["total_checks_count"] >= 4
        assert dq["overall_status"] in ("COMPLIANT", "ATTENTION_REQUIRED")


@pytest.mark.asyncio
async def test_state_analytics():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "admin@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}
        resp = await client.get("/api/v1/analytics/states", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        states = data["data"]
        assert isinstance(states, list)
        assert len(states) >= 1
        st = states[0]
        assert "state_name" in st
        assert "acquisition_percent" in st
        assert "performance_category" in st


@pytest.mark.asyncio
async def test_district_analytics():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "admin@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}
        resp = await client.get("/api/v1/analytics/districts", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        districts = data["data"]
        assert isinstance(districts, list)
        assert len(districts) >= 1
        d = districts[0]
        assert "district_name" in d
        assert "land_proposed_acres" in d


@pytest.mark.asyncio
async def test_time_series_analytics():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "admin@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}
        resp = await client.get("/api/v1/analytics/time-series", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        ts = data["data"]
        assert "data_points" in ts
        pts = ts["data_points"]
        assert len(pts) >= 1
        assert "period_label" in pts[0]
        assert "land_acquired_acres_cumulative" in pts[0]


@pytest.mark.asyncio
async def test_bottlenecks_analytics():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "admin@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}
        resp = await client.get("/api/v1/analytics/bottlenecks", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        bottlenecks = data["data"]
        assert isinstance(bottlenecks, list)
        if bottlenecks:
            b = bottlenecks[0]
            assert "severity" in b
            assert b["severity"] in ("CRITICAL", "AT_RISK", "WATCH", "ON_TRACK")
            assert "primary_reason" in b


@pytest.mark.asyncio
async def test_data_quality_reconciliation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "admin@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}
        resp = await client.get("/api/v1/analytics/data-quality", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        dq = data["data"]
        assert dq["total_checks_count"] >= 4
        for check in dq["checks"]:
            assert "check_id" in check
            assert "is_compliant" in check
