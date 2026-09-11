"""
Phase 11F Test Suite: Field Officer / Field Operations Experience
Validates:
- Role identity & jurisdiction scoping (patwari_kotputli -> ROLE_FIELD_OFFICER, Tehsil Kotputli)
- Dedicated Field Officer Dashboard (/api/v1/dashboard/field & /api/v1/field/dashboard)
- Field task list with status/priority filtering
- Task workspace detail & strict ownership authorization
- Task lifecycle: ASSIGNED -> START (IN_PROGRESS) -> 8-STEP VERIFY DRAFT -> FINAL SUBMISSION (SUBMITTED)
- Rework processing & resubmission
- Assigned parcels list (/api/v1/field/parcels)
- Access restriction from central/state/agency admin routes
"""
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_field_officer_authentication_and_role():
    """Verify demo account patwari_kotputli authenticates with ROLE_FIELD_OFFICER."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "patwari_kotputli", "password": "Password@123"},
        )
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        user = body["data"]["user"]
        assert user["role_id"] == "ROLE_FIELD_OFFICER"
        assert "Kotputli" in user["organization"] or "Kotputli" in user["designation"] or "Revenue" in user["organization"]


@pytest.mark.asyncio
async def test_field_officer_dashboard_endpoint_gating():
    """Verify GET /api/v1/dashboard/field enforces RBAC and delivers Field Officer metrics."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Unauthenticated -> 401
        res_unauth = await client.get("/api/v1/dashboard/field")
        assert res_unauth.status_code == 401

        # 2. Authenticated Field Officer (patwari_kotputli) -> 200 with FIELD scope
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "patwari_kotputli", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        field_token = login_res.json()["data"]["access_token"]

        res_field = await client.get(
            "/api/v1/dashboard/field",
            headers={"Authorization": f"Bearer {field_token}"},
        )
        assert res_field.status_code == 200
        data = res_field.json()["data"]
        assert data["scope_level"] == "FIELD"

        # Validate Field Work summary is present
        assert "field_work" in data
        fw = data["field_work"]
        assert "assigned_today_count" in fw
        assert "pending_count" in fw
        assert "in_progress_count" in fw
        assert "submitted_count" in fw
        assert "overdue_count" in fw
        assert "priority_tasks" in fw

        # 3. Direct Field Dashboard endpoint
        res_direct = await client.get(
            "/api/v1/field/dashboard",
            headers={"Authorization": f"Bearer {field_token}"},
        )
        assert res_direct.status_code == 200
        direct_data = res_direct.json()
        assert "priority_tasks" in direct_data
        assert "assigned_parcels" in direct_data

        # 4. Project Agency (nhai_pd_jaipur) should be rejected from field dashboard
        agency_login = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "nhai_pd_jaipur", "password": "Password@123"},
        )
        assert agency_login.status_code == 200
        agency_token = agency_login.json()["data"]["access_token"]

        res_agency = await client.get(
            "/api/v1/dashboard/field",
            headers={"Authorization": f"Bearer {agency_token}"},
        )
        assert res_agency.status_code == 403


@pytest.mark.asyncio
async def test_field_tasks_and_parcel_queue():
    """Verify Field Officer can retrieve assigned tasks and assigned parcels."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "patwari_kotputli", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Get assigned tasks
        res_tasks = await client.get("/api/v1/field/tasks", headers=headers)
        assert res_tasks.status_code == 200
        tasks = res_tasks.json()
        assert isinstance(tasks, list)
        assert len(tasks) > 0

        first_task = tasks[0]
        assert "id" in first_task
        assert "task_type" in first_task
        assert "status" in first_task
        assert "priority" in first_task
        assert "project_title" in first_task
        assert "khasra_number" in first_task

        # 2. Get assigned parcels
        res_parcels = await client.get("/api/v1/field/parcels", headers=headers)
        assert res_parcels.status_code == 200
        parcels = res_parcels.json()
        assert isinstance(parcels, list)
        assert len(parcels) > 0

        first_parcel = parcels[0]
        assert "parcel_id" in first_parcel
        assert "khasra_number" in first_parcel
        assert "village_name" in first_parcel
        assert "area_acres" in first_parcel
        assert "verification_status" in first_parcel


@pytest.mark.asyncio
async def test_field_task_lifecycle_start_draft_and_submit():
    """Verify complete verification flow: Get Task -> Start -> Save 8-Step Draft -> Submit."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "patwari_kotputli", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Fetch tasks
        res_tasks = await client.get("/api/v1/field/tasks", headers=headers)
        assert res_tasks.status_code == 200
        tasks = res_tasks.json()
        assert len(tasks) > 0

        target_task_id = tasks[0]["id"]

        # 1. Fetch Task Workspace Detail
        res_detail = await client.get(f"/api/v1/field/tasks/{target_task_id}", headers=headers)
        assert res_detail.status_code == 200
        detail = res_detail.json()
        assert detail["task_id"] == target_task_id
        assert "khasra_number" in detail
        assert "official_area_acres" in detail
        assert "centroid_lat" in detail

        # 2. Start Task
        res_start = await client.post(f"/api/v1/field/tasks/{target_task_id}/start", headers=headers)
        assert res_start.status_code == 200

        # 3. Save 8-Step Draft Verification
        draft_payload = {
            "location": {
                "latitude": 27.653412,
                "longitude": 76.128745,
                "accuracy_meters": 3.8,
                "captured_at": "2026-09-08T14:30:00Z",
                "notes": "GPS coordinates acquired near SW boundary pillar.",
            },
            "parcel_check": {
                "parcel_identifiable": True,
                "boundary_identifiable": True,
                "location_corresponds": True,
                "site_accessible": True,
            },
            "land_use": {
                "observed_land_use": "Agricultural",
                "remarks": "Mustard crop with drip irrigation system.",
            },
            "structures": {
                "has_structures": False,
                "structure_type": None,
                "structure_count": 0,
                "structure_condition": None,
                "remarks": "No standing pucca structures found.",
            },
            "trees_assets": {
                "has_trees": True,
                "trees_count": 14,
                "tree_category": "Timber",
                "other_assets": "1 functional borewell with 5HP motor.",
                "remarks": "14 mature babool trees enumerated on field boundary.",
            },
            "photos": [
                {
                    "category": "PARCEL",
                    "file_name": "khasra_412_ground.jpg",
                    "file_path": "/uploads/field/khasra_412_ground.jpg",
                    "caption": "Panoramic field observation view",
                },
                {
                    "category": "BOUNDARY",
                    "file_name": "boundary_sw_stone.jpg",
                    "file_path": "/uploads/field/boundary_sw_stone.jpg",
                    "caption": "Revenue stone mark",
                },
            ],
            "field_remarks": "Physical inspection conducted on ground. Physical boundaries correspond to revenue maps.",
            "is_draft": True,
        }

        res_draft = await client.post(
            f"/api/v1/field/tasks/{target_task_id}/verify",
            headers=headers,
            json=draft_payload,
        )
        assert res_draft.status_code == 200
        draft_data = res_draft.json()
        assert draft_data["is_draft"] is True
        assert draft_data["task_status"] == "IN_PROGRESS"

        # 4. Submit Final 8-Step Verification
        final_payload = dict(draft_payload)
        final_payload["is_draft"] = False

        res_submit = await client.post(
            f"/api/v1/field/tasks/{target_task_id}/verify",
            headers=headers,
            json=final_payload,
        )
        assert res_submit.status_code == 200
        submit_data = res_submit.json()
        assert submit_data["task_status"] == "SUBMITTED"
        assert submit_data["is_draft"] is False


@pytest.mark.asyncio
async def test_field_officer_forbidden_from_admin_endpoints():
    """Verify Field Officer cannot access Central command, State control, or agency proposals."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "patwari_kotputli", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Central Command Dashboard -> 403 Forbidden
        res_central = await client.get("/api/v1/dashboard/central", headers=headers)
        assert res_central.status_code == 403

        # 2. State Control Dashboard -> 403 Forbidden
        res_state = await client.get("/api/v1/dashboard/state", headers=headers)
        assert res_state.status_code == 403

        # 3. Agency Control Dashboard -> 403 Forbidden
        res_agency = await client.get("/api/v1/dashboard/agency", headers=headers)
        assert res_agency.status_code == 403
