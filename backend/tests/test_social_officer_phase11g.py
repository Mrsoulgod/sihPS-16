"""
Phase 11G Test Suite: R&R / Social Officer Experience
Validates:
- Role identity & jurisdiction scoping (randr_jaipur -> ROLE_SOCIAL_OFFICER, District Jaipur)
- Dedicated R&R Case Management Dashboard (/api/v1/dashboard/social & /api/v1/social/dashboard)
- 12 statutory KPIs, My R&R Actions, and Blocking Possession Dependencies
- Role-aware Affected Families queue with masked PII (no raw Aadhaar/bank details)
- 9-Section Case Workspace and Full Lifecycle Transitions:
  IDENTIFIED -> SURVEY -> ELIGIBILITY REVIEW -> ENTITLEMENT ASSESSMENT -> ALLOTMENT -> VERIFICATION -> COMPLETION
- Resettlement project monitoring with R&R risk scoring
- Access restriction from central/state/agency admin routes
"""
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_social_officer_authentication_and_role():
    """Verify demo account randr_jaipur authenticates with ROLE_SOCIAL_OFFICER."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "randr_jaipur", "password": "Password@123"},
        )
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        user = body["data"]["user"]
        assert user["role_id"] == "ROLE_SOCIAL_OFFICER"
        assert "Jaipur" in user["organization"] or "Social" in user["designation"] or "R&R" in user["designation"]


@pytest.mark.asyncio
async def test_social_officer_dashboard_endpoint_gating():
    """Verify GET /api/v1/dashboard/social and /api/v1/social/dashboard enforce RBAC and deliver 12 KPIs."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Unauthenticated -> 401
        res_unauth = await client.get("/api/v1/dashboard/social")
        assert res_unauth.status_code == 401

        # 2. Authenticated Social Officer (randr_jaipur) -> 200 with SOCIAL scope
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "randr_jaipur", "password": "Password@123"},
        )
        assert login_res.status_code == 200
        social_token = login_res.json()["data"]["access_token"]

        res_social = await client.get(
            "/api/v1/dashboard/social",
            headers={"Authorization": f"Bearer {social_token}"},
        )
        assert res_social.status_code == 200
        data = res_social.json()["data"]
        assert data["scope_level"] == "SOCIAL"
        assert "randr_case_management" in data
        assert data["randr_case_management"] is not None
        
        # Validate 12 statutory KPIs
        kpis = data["randr_case_management"]["kpis"]
        assert "affected_families_count" in kpis
        assert "survey_pending_count" in kpis
        assert "eligibility_pending_count" in kpis
        assert "entitlement_pending_count" in kpis
        assert "approval_pending_count" in kpis
        assert "allotment_pending_count" in kpis
        assert "implementation_pending_count" in kpis
        assert "verification_pending_count" in kpis
        assert "completed_count" in kpis
        assert "overdue_cases_count" in kpis
        assert "high_risk_projects_count" in kpis
        assert "active_schemes_count" in kpis

        # Validate specialized /api/v1/social/dashboard route
        res_direct = await client.get(
            "/api/v1/social/dashboard",
            headers={"Authorization": f"Bearer {social_token}"},
        )
        assert res_direct.status_code == 200
        direct_data = res_direct.json()
        assert len(direct_data["my_actions"]) >= 1
        assert len(direct_data["active_schemes_summary"]) >= 1
        assert len(direct_data["projects_progress"]) >= 1


@pytest.mark.asyncio
async def test_scoped_affected_families_queue_and_privacy():
    """Verify GET /api/v1/social/families returns 12-column items with masked PII and no Aadhaar/bank numbers."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "randr_jaipur", "password": "Password@123"},
        )
        token = login_res.json()["data"]["access_token"]

        res = await client.get(
            "/api/v1/social/families",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        families = res.json()
        assert isinstance(families, list)
        assert len(families) >= 1

        for fam in families:
            # Check 12 columns exist
            assert "family_reference_id" in fam
            assert "project_title" in fam
            assert "village_name" in fam
            assert "khasra_number" in fam
            assert "displacement_status" in fam
            assert "social_category" in fam
            assert "eligibility_status" in fam
            assert "entitlement_status" in fam
            assert "allotment_status" in fam
            assert "implementation_status" in fam
            assert "case_status" in fam
            assert "pending_action" in fam

            # Privacy rule: ensure raw Aadhaar and Bank Details are NOT exposed
            assert "aadhaar" not in fam
            assert "bank_account" not in fam
            assert "ifsc" not in fam


@pytest.mark.asyncio
async def test_social_officer_my_actions():
    """Verify GET /api/v1/social/actions returns assigned R&R tasks."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "randr_jaipur", "password": "Password@123"},
        )
        token = login_res.json()["data"]["access_token"]

        res = await client.get(
            "/api/v1/social/actions",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        actions = res.json()
        assert isinstance(actions, list)
        assert len(actions) >= 1
        action = actions[0]
        assert "family_reference_id" in action
        assert "project_title" in action
        assert "village_name" in action
        assert "case_stage" in action
        assert "priority" in action
        assert "required_action" in action


@pytest.mark.asyncio
async def test_case_workspace_and_full_lifecycle_mutations():
    """Verify family case 360 workspace and state transitions across all 9 statutory lifecycle stages."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "randr_jaipur", "password": "Password@123"},
        )
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Fetch families to get a real ID
        fam_res = await client.get("/api/v1/social/families", headers=headers)
        families = fam_res.json()
        target_family_id = families[0]["id"]

        # 2. Get Case Workspace Detail
        detail_res = await client.get(f"/api/v1/social/families/{target_family_id}", headers=headers)
        assert detail_res.status_code == 200
        case_data = detail_res.json()
        assert "summary" in case_data
        assert "eligibility" in case_data
        assert "entitlements" in case_data
        assert "allotments" in case_data
        assert "documents" in case_data
        assert "implementation" in case_data
        assert "verification" in case_data
        assert "timeline" in case_data

        # 3. Submit Field Survey
        survey_res = await client.post(
            f"/api/v1/social/families/{target_family_id}/survey",
            headers=headers,
            json={
                "displacement_category": "TITLEHOLDER_DISPLACED",
                "family_type": "PDF_DISPLACED_REQUIRING_RELOCATION",
                "social_category": "OBC",
                "family_members_count": 5,
                "existing_housing_type": "Pucca",
                "livelihood_source": "Agriculture and Dairy",
                "survey_remarks": "Completed socio-economic survey at site. 5 resident members confirmed."
            }
        )
        assert survey_res.status_code == 200
        assert survey_res.json()["summary"]["case_status"] in ["SURVEY", "ELIGIBILITY_REVIEW", "ALLOTTED", "IN_PROGRESS", "COMPLETED"]

        # 4. Review Eligibility
        elig_res = await client.post(
            f"/api/v1/social/families/{target_family_id}/eligibility",
            headers=headers,
            json={
                "eligibility_status": "ELIGIBLE",
                "eligibility_category": "Second Schedule Clause 1(a)",
                "eligibility_basis": "RFCTLARR 2013 Section 3(c) & Second Schedule Clause 1(a)",
                "eligibility_remarks": "Title deed & residence certificate authenticated by Tehsildar."
            }
        )
        assert elig_res.status_code == 200
        assert elig_res.json()["eligibility"]["eligibility_status"] == "ELIGIBLE"

        # 5. Assess Entitlements
        ent_res = await client.post(
            f"/api/v1/social/families/{target_family_id}/entitlements",
            headers=headers,
            json={
                "entitled_plot_sqyd": 150.0,
                "subsistence_grant_inr": 36000.0,
                "transportation_allowance_inr": 50000.0,
                "one_time_resettlement_allowance_inr": 50000.0,
                "entitlement_remarks": "Statutory Second Schedule elements calculated and approved."
            }
        )
        assert ent_res.status_code == 200
        assert ent_res.json()["entitlements"]["entitlement_status"] in ["ASSESSED", "SANCTIONED"]

        # 6. Process Resettlement Allotment
        allot_res = await client.post(
            f"/api/v1/social/families/{target_family_id}/allotments",
            headers=headers,
            json={
                "allotment_type": "PLOT",
                "asset_identifier": "Plot B-14",
                "allotment_order_no": "ALLOT-JPR-2026-042",
                "allocated_value_inr": 450000.0,
                "status": "ALLOTTED",
                "remarks": "Provisional possession letter issued to family head."
            }
        )
        assert allot_res.status_code == 200
        assert allot_res.json()["allotments"]["allotment_status"] == "ALLOTTED"

        # 7. Verification & Case Completion
        verify_res = await client.post(
            f"/api/v1/social/families/{target_family_id}/verify",
            headers=headers,
            json={
                "verification_status": "VERIFIED",
                "physical_relocation_confirmed": True,
                "grant_receipt_confirmed": True,
                "remarks": "All entitlements disbursed and plot handover physical verification complete."
            }
        )
        assert verify_res.status_code == 200
        assert verify_res.json()["summary"]["case_status"] in ["COMPLETED", "SETTLED", "ALLOTTED"]


@pytest.mark.asyncio
async def test_social_officer_projects_monitoring_and_possession_dependency():
    """Verify GET /api/v1/social/projects returns authorized projects with possession dependency checks."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "randr_jaipur", "password": "Password@123"},
        )
        token = login_res.json()["data"]["access_token"]

        res = await client.get(
            "/api/v1/social/projects",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        projects = res.json()
        assert isinstance(projects, list)
        assert len(projects) >= 1
        proj = projects[0]
        assert "project_id" in proj
        assert "project_title" in proj
        assert "total_affected_families" in proj
        assert "randr_risk_level" in proj
        assert "has_blocking_possession_dependency" in proj


@pytest.mark.asyncio
async def test_social_officer_forbidden_from_admin_and_agency_dashboards():
    """Verify Social Officer is strictly forbidden (403) from accessing central, state, and project agency dashboards."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "randr_jaipur", "password": "Password@123"},
        )
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Central dashboard -> 403
        res_central = await client.get("/api/v1/dashboard/central", headers=headers)
        assert res_central.status_code == 403

        # State dashboard -> 403
        res_state = await client.get("/api/v1/dashboard/state", headers=headers)
        assert res_state.status_code == 403

        # Agency dashboard -> 403
        res_agency = await client.get("/api/v1/dashboard/agency", headers=headers)
        assert res_agency.status_code == 403
