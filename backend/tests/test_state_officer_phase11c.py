"""
Phase 11C Test Suite: State Officer Experience (State Acquisition Control Center)
Validates role identity, jurisdiction scoping, 12 State KPIs, district performance matrix,
district escalations, state attention queue, state compensation/possession/R&R overviews,
and cross-state data isolation.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_state_officer_dashboard_endpoint_role_gating():
    """Verify GET /api/v1/dashboard/state enforces statutory RBAC."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Unauthenticated request should return 401
        res_unauth = await client.get("/api/v1/dashboard/state")
        assert res_unauth.status_code == 401

        # 2. Authenticated State Officer should receive 200
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "state_rj_officer", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        state_token = login_res.json()["data"]["access_token"]

        res_state = await client.get(
            "/api/v1/dashboard/state",
            headers={"Authorization": f"Bearer {state_token}"},
        )
        assert res_state.status_code == 200
        data = res_state.json()["data"]
        assert data["scope_level"] == "STATE"
        assert "Rajasthan" in data["jurisdiction_name"]
        assert data["state_id"] == "IN-RJ"

        # 3. Admin user should also be permitted
        admin_login = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "admin", "password": "Password@123"},
        )
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["data"]["access_token"]

        res_admin = await client.get(
            "/api/v1/dashboard/state",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert res_admin.status_code == 200

        # 4. Central Officer (non-admin) should be 403 Forbidden
        central_login = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "central_admin", "password": "Password@123"},
        )
        assert central_login.status_code == 200
        central_token = central_login.json()["data"]["access_token"]

        res_central = await client.get(
            "/api/v1/dashboard/state",
            headers={"Authorization": f"Bearer {central_token}"},
        )
        assert res_central.status_code == 403


@pytest.mark.asyncio
async def test_state_officer_12_kpis_and_district_matrix():
    """Verify State Officer receives complete 12 State KPIs and district performance matrix."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "state_rj_officer", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        state_token = login_res.json()["data"]["access_token"]

        response = await client.get(
            "/api/v1/dashboard/state",
            headers={"Authorization": f"Bearer {state_token}"},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True

        data = body["data"]
        kpis = data["kpis"]

        # Validate 12 State Statutory KPIs
        assert kpis["total_projects"] > 0
        assert kpis["districts_with_active_acquisition"] >= 4
        assert kpis["total_land_proposed_acres"] > 0
        assert kpis["total_land_acquired_acres"] > 0
        assert kpis["total_land_pending_acres"] >= 0
        assert kpis["compensation_assessed_cr"] > 0
        assert kpis["compensation_awarded_cr"] > 0
        assert kpis["compensation_disbursed_cr"] > 0
        assert kpis["total_possession_acres"] > 0
        assert kpis["affected_families"] > 0
        assert "projects_at_risk" in kpis
        assert "overdue_tasks" in kpis

        # Validate District Performance Matrix
        dist_perf = data.get("district_performance")
        assert dist_perf is not None
        assert len(dist_perf) >= 4

        district_names = [d["district_name"] for d in dist_perf]
        assert "Jaipur" in district_names
        assert "Alwar" in district_names
        assert "Dausa" in district_names
        assert "Kotputli-Behror" in district_names

        # Verify all districts belong to Rajasthan
        for d in dist_perf:
            assert d["state_id"] == "IN-RJ" or d["state_name"] == "Rajasthan"
            assert d["project_count"] >= 1
            assert d["acquisition_percent"] >= 0
            assert d["possession_percent"] >= 0
            assert d["randr_completion_percent"] >= 0


@pytest.mark.asyncio
async def test_state_officer_escalations_and_attention():
    """Verify State Officer receives District Escalations and State Attention queue."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "state_rj_officer", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        state_token = login_res.json()["data"]["access_token"]

        response = await client.get(
            "/api/v1/dashboard/state",
            headers={"Authorization": f"Bearer {state_token}"},
        )
        assert response.status_code == 200
        data = response.json()["data"]

        # Validate District Escalations Queue
        escalations = data.get("district_escalations")
        assert escalations is not None
        assert len(escalations) >= 3
        for esc in escalations:
            assert "escalation_id" in esc
            assert "district_name" in esc
            assert "priority" in esc
            assert "reason" in esc
            assert "current_owner" in esc

        # Validate State Attention Queue
        attention = data.get("state_attention")
        assert attention is not None
        assert len(attention) >= 3
        for attn in attention:
            assert "item_id" in attn
            assert "priority" in attn
            assert "category" in attn
            assert "description" in attn
            assert "action_required" in attn


@pytest.mark.asyncio
async def test_state_officer_specialized_monitoring_modules():
    """Verify State Compensation, Possession, and R&R breakdowns."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "state_rj_officer", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        state_token = login_res.json()["data"]["access_token"]

        response = await client.get(
            "/api/v1/dashboard/state",
            headers={"Authorization": f"Bearer {state_token}"},
        )
        assert response.status_code == 200
        data = response.json()["data"]

        # Compensation Overview
        comp = data.get("state_compensation")
        assert comp is not None
        assert comp["total_assessed_cr"] > 0
        assert comp["total_disbursed_cr"] > 0
        assert len(comp["district_disbursements"]) >= 4

        # Possession Overview
        poss = data.get("state_possession")
        assert poss is not None
        assert poss["land_requiring_possession_acres"] > 0
        assert len(poss["district_possessions"]) >= 4

        # R&R Overview
        rr = data.get("state_randr")
        assert rr is not None
        assert rr["affected_families"] > 0
        assert len(rr["district_randr"]) >= 4


@pytest.mark.asyncio
async def test_state_officer_summary_endpoint_automatic_scoping():
    """Verify GET /api/v1/dashboard/summary automatically scopes to state for ROLE_STATE_OFFICER."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "state_rj_officer", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        state_token = login_res.json()["data"]["access_token"]

        response = await client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {state_token}"},
        )
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["scope_level"] == "STATE"
        assert "Rajasthan" in data["jurisdiction_name"]
        assert data["state_id"] == "IN-RJ"
        assert data["district_performance"] is not None
