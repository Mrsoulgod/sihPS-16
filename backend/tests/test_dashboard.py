import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings


async def get_token_for(client: AsyncClient, email: str) -> str:
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": email, "password": settings.DEMO_USER_PASSWORD},
    )
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_dashboard_unauthenticated():
    """Verify unauthorized access to /dashboard/summary returns 401."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/dashboard/summary")
        assert res.status_code == 401
        assert res.json()["success"] is False


@pytest.mark.asyncio
async def test_dashboard_central_officer_national_scope():
    """Verify CENTRAL_OFFICER receives aggregated national command overview."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "central@gov.demo")
        res = await client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        data = body["data"]

        # Scope verification
        assert data["scope_level"] == "NATIONAL"
        assert "All India" in data["jurisdiction_name"]

        # KPIs verification
        kpis = data["kpis"]
        assert kpis["total_projects"] == 5
        assert kpis["total_land_proposed_acres"] > 1000.0
        assert kpis["total_land_acquired_acres"] > 0
        assert 0 <= kpis["overall_acquisition_percent"] <= 100
        assert kpis["compensation_assessed_cr"] > 1000.0
        assert kpis["total_paf_count"] > 2000

        # Acquisition overview
        acq = data["acquisition_overview"]
        assert acq["land_proposed_acres"] == kpis["total_land_proposed_acres"]
        assert acq["land_remaining_acres"] >= 0

        # Status counts
        status = data["status_breakdown"]
        assert status["total"] == 5
        assert status["on_track"] + status["at_risk"] + status["delayed"] + status["completed"] == 5

        # State progress list
        states = data["state_progress"]
        assert len(states) >= 3
        state_names = [s["state_name"] for s in states]
        assert "Rajasthan" in state_names
        assert "Haryana" in state_names
        assert "Delhi (NCT)" in state_names

        # Attention projects
        attention = data["attention_projects"]
        assert len(attention) >= 2
        attention_codes = [p["project_code"] for p in attention]
        assert "PRJ-GUR-METRO" in attention_codes or "PRJ-NH48-PKG4" in attention_codes

        # Recent activity
        activity = data["recent_activity"]
        assert len(activity) > 0

        # Quick actions
        qa = data["quick_actions"]
        assert len(qa) == 3
        assert any("National Project Pipeline" in a["label"] for a in qa)


@pytest.mark.asyncio
async def test_dashboard_state_officer_scoped():
    """Verify STATE_OFFICER is strictly scoped to Rajasthan (IN-RJ)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "state@gov.demo")
        res = await client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        data = res.json()["data"]

        # Scope verification
        assert data["scope_level"] == "STATE"
        assert "Rajasthan" in data["jurisdiction_name"]

        # In Rajasthan, we have Jaipur (NH-48) and Alwar (WDFC) = 2 projects
        kpis = data["kpis"]
        assert kpis["total_projects"] == 2
        assert kpis["total_land_proposed_acres"] == 820.0  # 500 + 320

        # State progress should be limited to Rajasthan
        assert len(data["state_progress"]) == 1
        assert data["state_progress"][0]["state_name"] == "Rajasthan"


@pytest.mark.asyncio
async def test_dashboard_district_officer_scoped():
    """Verify DISTRICT_OFFICER is strictly scoped to Jaipur (DST-JAI)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "district@gov.demo")
        res = await client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        data = res.json()["data"]

        # Scope verification
        assert data["scope_level"] == "DISTRICT"
        assert "Jaipur" in data["jurisdiction_name"]

        # Only Jaipur NH-48 project
        kpis = data["kpis"]
        assert kpis["total_projects"] == 1
        assert kpis["total_land_proposed_acres"] == 500.0
        assert kpis["compensation_assessed_cr"] == 620.0

        # CALA-specific quick actions
        qa = data["quick_actions"]
        qa_labels = [a["label"] for a in qa]
        assert "Section 15 Objection Hearings" in qa_labels
        assert "Authorize PFMS Batch" in qa_labels


@pytest.mark.asyncio
async def test_dashboard_project_agency_scoped():
    """Verify PROJECT_AGENCY (NHAI) sees projects affiliated with their agency."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "agency@gov.demo")
        res = await client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        data = res.json()["data"]
        assert data["scope_level"] == "AGENCY"
        assert data["kpis"]["total_projects"] >= 2  # NH-48 and DAK Expressway created by or affiliated with NHAI
        qa_labels = [a["label"] for a in data["quick_actions"]]
        assert "Submit Project DPR" in qa_labels


@pytest.mark.asyncio
async def test_dashboard_field_officer_scoped():
    """Verify FIELD_OFFICER sees field operations scope and surveyor actions."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "field@gov.demo")
        res = await client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        data = res.json()["data"]
        assert data["scope_level"] == "FIELD"
        qa_labels = [a["label"] for a in data["quick_actions"]]
        assert "Cadastral Ground Truthing" in qa_labels
        assert "Landowner KYC Verification" in qa_labels
