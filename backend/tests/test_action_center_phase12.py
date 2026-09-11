"""
Phase 12 — Action Centre Integration Tests

Tests the centralized Action Centre:
  1. All 6 roles get scoped Action Centre summaries with live KPIs.
  2. Dynamic action generation obeys the Section 11 Permission Matrix.
  3. Action execution (APPROVE, REQUEST_REWORK, FORWARD) mutates task status.
  4. Task assignment RBAC: government officers can delegate, agencies cannot.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


DEMO_PASSWORD = "Password@123"

# Map of short role keys to actual demo usernames from demo_users.py
DEMO_ACCOUNTS = {
    "central":  "central_admin",
    "state":    "state_rj_officer",
    "district": "cala_jaipur",
    "agency":   "nhai_pd_jaipur",
    "field":    "patwari_kotputli",
    "social":   "randr_jaipur",
}


async def _login(client: AsyncClient, username: str) -> str:
    """Helper: log in a demo user and return the JWT token."""
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": username, "password": DEMO_PASSWORD},
    )
    assert res.status_code == 200, f"Login failed for {username}: {res.text}"
    return res.json()["data"]["access_token"]


# ───────────────────────────────────────────────────────────────────────
# 1.  Summary endpoint — every role gets a scoped dashboard
# ───────────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_action_center_summary_across_all_six_roles():
    """Verify that all 6 canonical demo roles can fetch their scoped Action Centre summaries with real KPIs."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        for role_key, username in DEMO_ACCOUNTS.items():
            token = await _login(client, username)
            headers = {"Authorization": f"Bearer {token}"}

            res = await client.get("/api/v1/action-centre/summary", headers=headers)
            assert res.status_code == 200, f"Failed to fetch summary for {role_key} ({username}): {res.text}"
            data = res.json()

            # Verify structural contract
            assert "kpis" in data, f"Missing kpis for {role_key}"
            assert "my_actions" in data, f"Missing my_actions for {role_key}"
            assert "in_progress" in data, f"Missing in_progress for {role_key}"
            assert "returned_rework" in data, f"Missing returned_rework for {role_key}"
            assert "forwarded" in data, f"Missing forwarded for {role_key}"
            assert "completed" in data, f"Missing completed for {role_key}"
            assert "recent_activity" in data, f"Missing recent_activity for {role_key}"

            kpis = data["kpis"]
            assert kpis["requires_action"] >= 0
            assert kpis["in_progress"] >= 0
            assert kpis["completed"] >= 0

            # Verify action item structure if present
            all_items = (
                data["my_actions"]
                + data["in_progress"]
                + data["returned_rework"]
                + data["forwarded"]
                + data["completed"]
            )
            for item in all_items:
                assert "id" in item
                assert "title" in item
                assert "record_type" in item
                assert "record_reference" in item
                assert "workflow_stage" in item
                assert "status" in item
                assert "priority" in item
                assert "assigned_role" in item


# ───────────────────────────────────────────────────────────────────────
# 2.  Dynamic Action Permission Matrix per role
# ───────────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_action_center_dynamic_available_actions_permission_matrix():
    """Verify Section 11 Action Permission Matrix: dynamic actions generated per role."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # --- District Officer (CALA) workspace ---
        token_cala = await _login(client, "cala_jaipur")
        headers_cala = {"Authorization": f"Bearer {token_cala}"}

        res_ws_cala = await client.get("/api/v1/action-centre/actions/act-dst-001", headers=headers_cala)
        assert res_ws_cala.status_code == 200
        ws_cala = res_ws_cala.json()
        assert "available_actions" in ws_cala
        cala_actions = [a["action"] for a in ws_cala["available_actions"]]
        assert "APPROVE" in cala_actions
        assert "REQUEST_REWORK" in cala_actions

        # --- Project Agency workspace ---
        token_agency = await _login(client, "nhai_pd_jaipur")
        headers_agency = {"Authorization": f"Bearer {token_agency}"}

        res_ws_agency = await client.get("/api/v1/action-centre/actions/act-agy-001", headers=headers_agency)
        assert res_ws_agency.status_code == 200
        ws_agency = res_ws_agency.json()
        agency_actions = [a["action"] for a in ws_agency["available_actions"]]
        assert "SUBMIT" in agency_actions
        # Agency must NOT have government-stage APPROVE authority
        assert "APPROVE" not in agency_actions

        # --- Field Officer workspace ---
        token_fld = await _login(client, "patwari_kotputli")
        headers_fld = {"Authorization": f"Bearer {token_fld}"}

        res_ws_fld = await client.get("/api/v1/action-centre/actions/act-fld-001", headers=headers_fld)
        assert res_ws_fld.status_code == 200
        ws_fld = res_ws_fld.json()
        fld_actions = [a["action"] for a in ws_fld["available_actions"]]
        assert any(
            a in fld_actions for a in ("SUBMIT", "START_VERIFICATION", "SAVE_DRAFT", "REVIEW")
        ), f"Field officer had no expected action: {fld_actions}"

        # --- Social Officer workspace ---
        token_soc = await _login(client, "randr_jaipur")
        headers_soc = {"Authorization": f"Bearer {token_soc}"}

        res_ws_soc = await client.get("/api/v1/action-centre/actions/act-soc-001", headers=headers_soc)
        assert res_ws_soc.status_code == 200
        ws_soc = res_ws_soc.json()
        soc_actions = [a["action"] for a in ws_soc["available_actions"]]
        assert any(
            a in soc_actions for a in ("REVIEW_ELIGIBILITY", "COMPLETE", "ASSESS_ENTITLEMENTS")
        ), f"Social officer had no expected action: {soc_actions}"


# ───────────────────────────────────────────────────────────────────────
# 3.  Execute actions and verify state transitions
# ───────────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_action_execution_workflow_and_task_transitions():
    """Verify executing operational actions (APPROVE, REQUEST_REWORK, FORWARD) updates task status."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await _login(client, "cala_jaipur")
        headers = {"Authorization": f"Bearer {token}"}

        # 1. APPROVE
        res_approve = await client.post(
            "/api/v1/action-centre/actions/act-dst-001/execute",
            json={
                "action": "APPROVE",
                "remarks": "Verified cadastral boundary and revenue records. Scrutiny approved.",
            },
            headers=headers,
        )
        assert res_approve.status_code == 200
        assert res_approve.json()["status"] == "COMPLETED"

        # 2. REQUEST_REWORK
        res_rework = await client.post(
            "/api/v1/action-centre/actions/act-dst-002/execute",
            json={
                "action": "REQUEST_REWORK",
                "rework_reason": "Missing canal embankment buffer overlay in KML file.",
                "remarks": "Revisions requested from NHAI.",
            },
            headers=headers,
        )
        assert res_rework.status_code == 200
        assert res_rework.json()["status"] == "REWORK_REQUIRED"

        # 3. FORWARD
        res_forward = await client.post(
            "/api/v1/action-centre/actions/act-dst-003/execute",
            json={
                "action": "FORWARD",
                "target_authority_role": "ROLE_STATE_OFFICER",
                "remarks": "Forwarded for Section 19 notification sanction.",
            },
            headers=headers,
        )
        assert res_forward.status_code == 200
        assert res_forward.json()["status"] == "FORWARDED"


# ───────────────────────────────────────────────────────────────────────
# 4.  Task assignment RBAC
# ───────────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_action_centre_assign_task_rbacs():
    """Verify task assignment permissions: District Officer can assign, Project Agency is forbidden."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. District Officer assigns field verification task → 200 OK
        token_cala = await _login(client, "cala_jaipur")
        headers_cala = {"Authorization": f"Bearer {token_cala}"}

        assign_payload = {
            "action_id": "act-dst-001",
            "target_role": "ROLE_FIELD_OFFICER",
            "instructions": "Execute on-ground GPS survey and tree enumeration for Khasra 104/2.",
            "priority": "HIGH",
        }
        res_assign = await client.post(
            "/api/v1/action-centre/actions/assign",
            json=assign_payload,
            headers=headers_cala,
        )
        assert res_assign.status_code == 200
        assert res_assign.json()["assigned_role"] == "ROLE_FIELD_OFFICER"

        # 2. Project Agency attempts to assign → 403 Forbidden
        token_agency = await _login(client, "nhai_pd_jaipur")
        headers_agency = {"Authorization": f"Bearer {token_agency}"}

        res_agency_assign = await client.post(
            "/api/v1/action-centre/actions/assign",
            json=assign_payload,
            headers=headers_agency,
        )
        assert res_agency_assign.status_code == 403
