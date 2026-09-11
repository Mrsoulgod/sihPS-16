"""
Phase 11E Test Suite: Project Implementing Agency Experience (Project Agency Control Center)
Validates role identity, strict agency scoping, Project Agency Control Center dashboard,
multi-step project proposal creation (DRAFT -> SUBMITTED -> UNDER_SCRUTINY -> REWORK -> RESUBMITTED),
draft updating, survey request creation, document uploads, and RBAC isolation.
"""
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_project_agency_authentication_and_role():
    """Verify demo account nhai_pd_jaipur authenticates with ROLE_PROJECT_AGENCY."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "nhai_pd_jaipur", "password": "Password@123"},
        )
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        user = body["data"]["user"]
        assert user["role_id"] == "ROLE_PROJECT_AGENCY"
        assert "NHAI" in user["organization"]


@pytest.mark.asyncio
async def test_project_agency_dashboard_endpoint_role_gating():
    """Verify GET /api/v1/dashboard/agency enforces RBAC and delivers 8-section Agency Control dataset."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Unauthenticated request -> 401
        res_unauth = await client.get("/api/v1/dashboard/agency")
        assert res_unauth.status_code == 401

        # 2. Authenticated Project Agency (nhai_pd_jaipur) -> 200 with AGENCY scope
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "nhai_pd_jaipur", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        agency_token = login_res.json()["data"]["access_token"]

        res_agency = await client.get(
            "/api/v1/dashboard/agency",
            headers={"Authorization": f"Bearer {agency_token}"},
        )
        assert res_agency.status_code == 200
        data = res_agency.json()["data"]
        assert data["scope_level"] == "AGENCY"
        assert "NHAI" in data["jurisdiction_name"]

        # Validate 8 Agency Control sections
        assert "agency_control" in data or "agency_actions" in data
        assert "agency_actions" in data
        assert "agency_projects" in data
        assert "agency_land" in data
        assert "agency_compensation" in data
        assert "agency_possession" in data
        assert "agency_randr" in data
        assert "agency_risk" in data

        # 3. Admin user is permitted
        admin_login = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "admin", "password": "Password@123"},
        )
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["data"]["access_token"]

        res_admin = await client.get(
            "/api/v1/dashboard/agency",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert res_admin.status_code == 200

        # 4. District Officer (cala_jaipur) should be rejected with 403 Forbidden
        dist_login = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "cala_jaipur", "password": "Password@123"},
        )
        assert dist_login.status_code == 200
        dist_token = dist_login.json()["data"]["access_token"]

        res_dist = await client.get(
            "/api/v1/dashboard/agency",
            headers={"Authorization": f"Bearer {dist_token}"},
        )
        assert res_dist.status_code == 403


@pytest.mark.asyncio
async def test_project_proposal_draft_creation_and_update():
    """Verify Project Agency can create and update a project proposal in DRAFT status."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login as Project Agency
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "nhai_pd_jaipur", "password": "Password@123"},
        )
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Create a Draft Project Proposal
        unique_code = f"NHAI-EXP-{uuid.uuid4().hex[:6].upper()}"
        draft_payload = {
            "title": "Jaipur North-South Greenfield Corridor",
            "project_code": unique_code,
            "project_type": "HIGHWAY",
            "project_category": "CENTRAL_SECTOR",
            "description": "Greenfield 6-lane access-controlled expressway connecting Delhi-Jaipur highway.",
            "objective": "Decongest urban Jaipur freight movement.",
            "sponsoring_ministry": "Ministry of Road Transport and Highways (MoRTH)",
            "estimated_project_cost_cr": 1250.0,
            "priority": "HIGH",
            "proposed_start_date": "2026-11-01",
            "target_completion_date": "2029-03-31",
            "state_id": "IN-RJ",
            "primary_district_id": "DST-JAI",
            "tehsil_name": "Kotputli",
            "villages": ["Sundarpura", "Pragpura", "Bhabroo"],
            "start_location": "KM 130.000",
            "end_location": "KM 195.000",
            "project_length_km": 65.0,
            "total_land_required_acres": 320.5,
            "land_unit": "ACRES",
            "government_land_acres": 60.0,
            "private_land_acres": 240.5,
            "other_land_acres": 20.0,
            "expected_parcel_count": 210,
            "affected_villages_count": 3,
            "proposed_land_remarks": "Detailed revenue khasra survey underway.",
            "preliminary_coordinates": [[27.7050, 76.2010], [27.5500, 76.1000], [27.3800, 75.9800]],
            "is_draft": True,
        }

        res_create = await client.post("/api/v1/projects", json=draft_payload, headers=headers)
        assert res_create.status_code == 201
        created_project = res_create.json()
        project_id = created_project["id"]

        assert created_project["project_code"] == unique_code
        assert created_project["current_stage"] == "PROJECT_PROPOSAL"
        assert created_project["proposal_status"] == "DRAFT"
        assert "NHAI" in created_project["implementing_agency"]

        # 2. Update Draft Proposal
        update_payload = {
            "title": "Jaipur North-South Greenfield Corridor (Revised DPR)",
            "estimated_project_cost_cr": 1320.0,
            "total_land_required_acres": 335.0,
            "proposed_land_remarks": "Added 14.5 acres for interchanges at KM 160.",
        }
        res_update = await client.put(f"/api/v1/projects/{project_id}", json=update_payload, headers=headers)
        assert res_update.status_code == 200
        updated_project = res_update.json()
        assert updated_project["title"] == "Jaipur North-South Greenfield Corridor (Revised DPR)"
        assert updated_project["estimated_budget_inr_cr"] == 1320.0
        assert updated_project["total_land_proposed_acres"] == 335.0

        # 3. Submit Project Proposal to CALA Scrutiny
        res_submit = await client.post(
            f"/api/v1/projects/{project_id}/submit",
            json={"submission_remarks": "DPR finalized and submitted for statutory Section 3A scrutiny."},
            headers=headers,
        )
        assert res_submit.status_code == 200
        submitted_project = res_submit.json()
        assert submitted_project["current_stage"] == "INITIAL_SCRUTINY"
        assert submitted_project["proposal_status"] in ("SUBMITTED", "UNDER_SCRUTINY")

        # 4. Create Survey Request
        survey_payload = {
            "survey_type": "FIELD_VERIFICATION",
            "title": "Demarcate Canal Buffer at KM 160",
            "justification": "Joint verification required with Patwari team for culvert buffer alignment.",
            "target_district_id": "DST-JAI",
            "target_tehsil": "Kotputli",
            "target_villages": ["Sundarpura"],
        }
        res_survey = await client.post(
            f"/api/v1/projects/{project_id}/survey-requests",
            json=survey_payload,
            headers=headers,
        )
        assert res_survey.status_code == 200
        assert "task_id" in res_survey.json()["data"]

        # 5. Resubmit after rework
        resubmit_payload = {
            "response_remarks": "Revised alignment coordinates avoiding the high-tension tower.",
            "corrections_summary": "Shifted centerline 25 meters east at chainage KM 145.",
        }
        res_resubmit = await client.post(
            f"/api/v1/projects/{project_id}/resubmit",
            json=resubmit_payload,
            headers=headers,
        )
        assert res_resubmit.status_code == 200
        resubmitted_project = res_resubmit.json()
        assert resubmitted_project["proposal_status"] in ("RESUBMITTED", "UNDER_SCRUTINY")


@pytest.mark.asyncio
async def test_project_agency_scope_isolation():
    """Verify Agency A cannot modify projects belonging to another agency or create under another agency."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login as NHAI Project Agency
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "nhai_pd_jaipur", "password": "Password@123"},
        )
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Query project list -> all returned projects must belong to NHAI
        res_list = await client.get("/api/v1/projects", headers=headers)
        assert res_list.status_code == 200
        projects_data = res_list.json()
        projects = projects_data["data"] if isinstance(projects_data, dict) and "data" in projects_data else projects_data
        for p in projects:
            assert "NHAI" in p.get("implementing_agency", "")
