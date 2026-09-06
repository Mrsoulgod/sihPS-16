import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_central_dashboard_summary_11_kpis():
    """Verify that Central Officer receives all 11 national command KPIs."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Login as Central Officer
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "central_admin", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Query dashboard summary
        res = await client.get("/api/v1/dashboard/summary", headers=headers)
        assert res.status_code == 200
        data = res.json()["data"]

        # Check scope and jurisdiction
        assert data["scope_level"] == "NATIONAL"
        assert "National Command" in data["jurisdiction_name"] or "All India" in data["jurisdiction_name"]

        # Check all 11 KPIs
        kpis = data["kpis"]
        assert "total_projects" in kpis and kpis["total_projects"] >= 0
        assert "total_land_proposed_acres" in kpis and kpis["total_land_proposed_acres"] >= 0
        assert "total_land_acquired_acres" in kpis and kpis["total_land_acquired_acres"] >= 0
        assert "total_land_pending_acres" in kpis and kpis["total_land_pending_acres"] >= 0
        assert "compensation_assessed_cr" in kpis and kpis["compensation_assessed_cr"] >= 0
        assert "compensation_awarded_cr" in kpis and kpis["compensation_awarded_cr"] >= 0
        assert "compensation_disbursed_cr" in kpis and kpis["compensation_disbursed_cr"] >= 0
        assert "total_possession_acres" in kpis and kpis["total_possession_acres"] >= 0
        assert "affected_families" in kpis and kpis["affected_families"] >= 0
        assert "projects_at_risk" in kpis and kpis["projects_at_risk"] >= 0
        assert "overdue_tasks" in kpis and kpis["overdue_tasks"] >= 0


@pytest.mark.asyncio
async def test_central_dashboard_12_stage_funnel():
    """Verify the 12-stage RFCTLARR lifecycle funnel."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "central_admin", "password": "Password@123"},
        )
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await client.get("/api/v1/dashboard/central", headers=headers)
        assert res.status_code == 200
        data = res.json()["data"]

        assert "funnel" in data and data["funnel"] is not None
        funnel = data["funnel"]
        assert len(funnel) == 12

        stage_names = [s["stage_name"] for s in funnel]
        assert "Project Proposal & Requisition" in stage_names[0]
        assert "Compensation Assessment" in stage_names[6]
        assert "Section 23/30 Award Declaration" in stage_names[7]
        assert "Section 38 Physical Possession" in stage_names[9]
        assert "Corridor Acquisition Completion" in stage_names[11]


@pytest.mark.asyncio
async def test_central_state_performance_matrix():
    """Verify that State Performance comparative matrix is populated with required columns."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "central_admin", "password": "Password@123"},
        )
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await client.get("/api/v1/dashboard/central", headers=headers)
        assert res.status_code == 200
        data = res.json()["data"]

        states = data["state_progress"]
        assert len(states) >= 1
        rj = next((s for s in states if s["state_id"] == "IN-RJ" or "Rajasthan" in s["state_name"]), None)
        assert rj is not None
        assert rj["project_count"] >= 1
        assert "acquisition_percent" in rj
        assert "compensation_disbursed_cr" in rj
        assert "disbursement_percent" in rj
        assert "possession_percent" in rj
        assert "randr_completion_percent" in rj
        assert "delayed_tasks_count" in rj
        assert "risk_level" in rj


@pytest.mark.asyncio
async def test_central_critical_projects_and_attention():
    """Verify critical projects and central attention required sections."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "central_admin", "password": "Password@123"},
        )
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await client.get("/api/v1/dashboard/central", headers=headers)
        assert res.status_code == 200
        data = res.json()["data"]

        critical = data.get("critical_projects") or []
        assert len(critical) >= 1
        for cp in critical:
            assert cp["project_code"]
            assert cp["main_bottleneck"]
            assert cp["pending_action"]
            assert cp["risk_level"] in ("CRITICAL", "HIGH", "MODERATE", "LOW")

        attention = data.get("central_attention") or []
        assert len(attention) >= 1
        for item in attention:
            assert item["issue_id"]
            assert item["priority"] in ("CRITICAL", "HIGH", "MODERATE")
            assert item["current_authority"]


@pytest.mark.asyncio
async def test_central_endpoint_role_gating():
    """Verify that /dashboard/central is forbidden for field officers."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login as Field Officer (patwari_kotputli)
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "patwari_kotputli", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Attempt to access Central Command endpoint
        res = await client.get("/api/v1/dashboard/central", headers=headers)
        assert res.status_code == 403
