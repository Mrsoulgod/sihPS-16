"""
Phase 11D Test Suite: District / CALA Officer Experience (District Acquisition Control Center)
Validates role identity, strict district jurisdiction scoping, 14 District Statutory KPIs,
My Pending Actions work queue, Field Verification supervision, Objections & Claims,
Compensation assessments, Section 23/30 Awards, PFMS Disbursement monitoring,
Section 38 Possession, R&R coordination, and District-to-State Escalations.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_district_officer_dashboard_endpoint_role_gating():
    """Verify GET /api/v1/dashboard/district enforces statutory RBAC and rejects unauthorized roles."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Unauthenticated request should return 401
        res_unauth = await client.get("/api/v1/dashboard/district")
        assert res_unauth.status_code == 401

        # 2. Authenticated District Officer (cala_jaipur) should receive 200 with DISTRICT scope
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "cala_jaipur", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        district_token = login_res.json()["data"]["access_token"]

        res_district = await client.get(
            "/api/v1/dashboard/district",
            headers={"Authorization": f"Bearer {district_token}"},
        )
        assert res_district.status_code == 200
        data = res_district.json()["data"]
        assert data["scope_level"] == "DISTRICT"
        assert "Jaipur" in data["jurisdiction_name"]
        assert data["district_id"] == "DST-JAI"
        assert data["state_id"] == "IN-RJ"

        # 3. Admin user should also be permitted
        admin_login = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "admin", "password": "Password@123"},
        )
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["data"]["access_token"]

        res_admin = await client.get(
            "/api/v1/dashboard/district",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert res_admin.status_code == 200

        # 4. Central Officer (non-admin) should receive 403 Forbidden
        central_login = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "central_admin", "password": "Password@123"},
        )
        assert central_login.status_code == 200
        central_token = central_login.json()["data"]["access_token"]

        res_central = await client.get(
            "/api/v1/dashboard/district",
            headers={"Authorization": f"Bearer {central_token}"},
        )
        assert res_central.status_code == 403

        # 5. State Officer should receive 403 Forbidden for direct district endpoint
        state_login = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "state_rj_officer", "password": "Password@123"},
        )
        assert state_login.status_code == 200
        state_token = state_login.json()["data"]["access_token"]

        res_state = await client.get(
            "/api/v1/dashboard/district",
            headers={"Authorization": f"Bearer {state_token}"},
        )
        assert res_state.status_code == 403


@pytest.mark.asyncio
async def test_district_officer_14_statutory_kpis():
    """Verify District Officer receives all 14 District Statutory KPIs with non-null values."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "cala_jaipur", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        district_token = login_res.json()["data"]["access_token"]

        response = await client.get(
            "/api/v1/dashboard/district",
            headers={"Authorization": f"Bearer {district_token}"},
        )
        assert response.status_code == 200
        data = response.json()["data"]
        kpis = data["kpis"]

        # Validate 14 District Statutory KPIs
        # 1. Active Projects
        assert kpis["total_projects"] > 0
        # 2. Land Proposed
        assert kpis["total_land_proposed_acres"] > 0
        # 3. Land Acquired
        assert kpis["total_land_acquired_acres"] > 0
        # 4. Land Pending
        assert kpis["total_land_pending_acres"] >= 0
        # 5. Parcels Pending Verification
        assert kpis["parcels_pending_verification"] is not None and kpis["parcels_pending_verification"] >= 0
        # 6. Objections Pending
        assert kpis["objections_pending"] is not None and kpis["objections_pending"] >= 0
        # 7. Compensation Pending
        assert kpis["compensation_pending_cases"] is not None and kpis["compensation_pending_cases"] >= 0
        assert kpis["compensation_assessed_cr"] > 0
        # 8. Awards Pending
        assert kpis["awards_pending"] is not None and kpis["awards_pending"] >= 0
        # 9. Disbursement Pending
        assert kpis["disbursement_pending_cases"] is not None and kpis["disbursement_pending_cases"] >= 0
        assert kpis["compensation_disbursed_cr"] > 0
        # 10. Possession Pending
        assert kpis["possession_pending_cases"] is not None and kpis["possession_pending_cases"] >= 0
        assert kpis["total_possession_acres"] > 0
        # 11. Affected Families
        assert kpis["affected_families"] > 0
        # 12. R&R Pending
        assert kpis["randr_pending_cases"] is not None and kpis["randr_pending_cases"] >= 0
        # 13. Overdue Tasks
        assert kpis["overdue_tasks"] is not None and kpis["overdue_tasks"] >= 0
        # 14. High/Critical Risk Projects
        assert kpis["high_critical_risk_projects"] is not None and kpis["high_critical_risk_projects"] >= 0


@pytest.mark.asyncio
async def test_district_officer_my_actions_work_queue():
    """Verify District Officer receives prioritized pending tasks work queue."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "cala_jaipur", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        district_token = login_res.json()["data"]["access_token"]

        response = await client.get(
            "/api/v1/dashboard/district",
            headers={"Authorization": f"Bearer {district_token}"},
        )
        assert response.status_code == 200
        data = response.json()["data"]

        tasks = data.get("district_my_tasks") or data.get("my_tasks", [])
        assert len(tasks) > 0

        # Verify task structure
        first_task = tasks[0]
        assert "id" in first_task
        assert "task_name" in first_task
        assert "project_id" in first_task
        assert "project_title" in first_task
        assert "stage" in first_task
        assert first_task["priority"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
        assert first_task["sla_status"] in ["OVERDUE", "DUE_SOON", "NORMAL"]
        assert "target_route" in first_task


@pytest.mark.asyncio
async def test_district_officer_operational_subsystems():
    """Verify Field Verification, Objections, Compensation, Awards, Disbursement, Possession, R&R, Escalations."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "cala_jaipur", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        district_token = login_res.json()["data"]["access_token"]

        response = await client.get(
            "/api/v1/dashboard/district",
            headers={"Authorization": f"Bearer {district_token}"},
        )
        assert response.status_code == 200
        data = response.json()["data"]

        # 1. Field Verification
        fv = data.get("district_field_verification") or data.get("field_verification")
        assert fv is not None
        assert fv["assigned_count"] > 0
        assert fv["submitted_count"] > 0
        assert len(fv["items"]) > 0
        assert ("khasra" in fv["items"][0] or "khasra_number" in fv["items"][0])

        # 2. Objections & Claims
        obj = data.get("district_objections") or data.get("objections")
        assert obj is not None
        assert obj["total_count"] > 0
        assert len(obj["items"]) > 0
        assert ("reference_number" in obj["items"][0] or "ref_no" in obj["items"][0] or "ref" in obj["items"][0] or "id" in obj["items"][0])

        # 3. Compensation
        comp = data.get("district_compensation") or data.get("compensation")
        assert comp is not None
        assert comp["pending_assessment_count"] >= 0
        assert len(comp["items"]) > 0
        assert ("assessed_cr" in comp["items"][0] or "total_compensation_cr" in comp["items"][0] or "amount_cr" in comp["items"][0])

        # 4. Awards
        aw = data.get("district_awards") or data.get("awards")
        assert aw is not None
        assert aw["total_count"] > 0
        assert len(aw["items"]) > 0
        assert ("award_no" in aw["items"][0] or "award_number" in aw["items"][0])

        # 5. Disbursement
        disb = data.get("district_disbursement") or data.get("disbursement")
        assert disb is not None
        assert disb["total_disbursed_cr"] > 0
        assert len(disb["items"]) > 0
        assert ("batch_id" in disb["items"][0] or "disbursement_id" in disb["items"][0])

        # 6. Possession
        pos = data.get("district_possession") or data.get("possession")
        assert pos is not None
        assert (pos.get("possession_completed_acres", 0) > 0 or pos.get("possession_taken_acres", 0) > 0)
        assert len(pos["items"]) > 0

        # 7. R&R
        rr = data.get("district_randr") or data.get("randr")
        assert rr is not None
        assert rr["total_pafs"] > 0
        assert len(rr["items"]) > 0

        # 8. Escalations to State
        esc = data.get("district_escalations_to_state") or data.get("escalations")
        assert esc is not None
        assert len(esc) > 0
        assert esc[0]["current_owner"] is not None


@pytest.mark.asyncio
async def test_district_officer_general_dashboard_summary_scoping():
    """Verify GET /api/v1/dashboard/summary derives DISTRICT scope when called by cala_jaipur."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "cala_jaipur", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        district_token = login_res.json()["data"]["access_token"]

        response = await client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {district_token}"},
        )
        assert response.status_code == 200
        data = response.json()["data"]

        assert data["scope_level"] == "DISTRICT"
        assert "Jaipur" in data["jurisdiction_name"]
        assert data["district_id"] == "DST-JAI"
        assert data["district_my_tasks"] is not None
        assert len(data["district_my_tasks"]) > 0
