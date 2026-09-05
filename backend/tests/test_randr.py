import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings


async def get_auth_token(username: str) -> str:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/v1/auth/login",
            json={
                "username_or_email": username,
                "password": settings.DEMO_USER_PASSWORD,
            },
        )
        assert res.status_code == 200
        return res.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_list_randr_schemes():
    """Verify GET /api/v1/r-and-r returns seeded schemes with family progress counts."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/r-and-r")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        items = body["data"]
        assert len(items) >= 2
        # Check scheme reference and KPIs
        titles = [s["scheme_title"] for s in items]
        assert any("Kotputli" in t for t in titles)
        assert any("Shahpura" in t for t in titles)
        first = items[0]
        assert "progress_percent" in first
        assert "total_families_count" in first
        assert "sanctioned_budget_cr" in first


@pytest.mark.asyncio
async def test_get_randr_scheme_detail():
    """Verify GET /api/v1/r-and-r/{id} returns 360° detail with progress funnel and covered families."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        list_res = await client.get("/api/v1/r-and-r")
        scheme_id = list_res.json()["data"][0]["id"]

        detail_res = await client.get(f"/api/v1/r-and-r/{scheme_id}")
        assert detail_res.status_code == 200
        detail = detail_res.json()["data"]
        assert detail["id"] == scheme_id
        assert "kpis" in detail
        kpis = detail["kpis"]
        assert "total_affected_families" in kpis
        assert "eligible_families" in kpis
        assert "completion_percent" in kpis
        assert "families" in detail
        assert len(detail["families"]) > 0
        assert "allotments" in detail


@pytest.mark.asyncio
async def test_list_affected_families_and_filters():
    """Verify GET /api/v1/affected-families returns PAFs with masked references and supports filtering."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/affected-families")
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        items = body["data"]
        assert len(items) >= 18

        # Test filter by eligibility status
        appr_res = await client.get("/api/v1/affected-families?eligibility_status=APPROVED")
        assert appr_res.status_code == 200
        appr_items = appr_res.json()["data"]
        assert len(appr_items) >= 10
        assert all(f["eligibility_status"] == "APPROVED" for f in appr_items)

        # Test search filter
        search_res = await client.get("/api/v1/affected-families?search=AF-0001")
        assert search_res.status_code == 200
        found = search_res.json()["data"]
        assert len(found) == 1
        assert found[0]["family_reference_id"] == "AF-0001"


@pytest.mark.asyncio
async def test_affected_family_acquisition_trace():
    """
    Verify GET /api/v1/affected-families/{id} exposes the complete 360° acquisition trace:
    Family -> Project -> Parcel -> Owner -> Compensation -> Award -> Disbursement -> Possession -> R&R.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/affected-families?search=AF-0001")
        fam_id = res.json()["data"][0]["id"]

        detail_res = await client.get(f"/api/v1/affected-families/{fam_id}")
        assert detail_res.status_code == 200
        detail = detail_res.json()["data"]
        assert detail["family_reference_id"] == "AF-0001"
        assert "acquisition_trace" in detail
        trace = detail["acquisition_trace"]
        assert trace is not None
        assert trace["project_code"] == "PRJ-NH48-PKG4"
        assert trace["khasra_number"] == "101/1"
        assert trace["owner_name"] is not None
        assert trace["compensation_reference"] is not None
        assert trace["possession_reference"] is not None
        assert len(detail["allotments"]) >= 1


@pytest.mark.asyncio
async def test_configurable_eligibility_assessment_update():
    """Verify CALA can update Configurable R&R Eligibility Assessment and generate audit trail."""
    token = await get_auth_token("cala_jaipur")
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {token}"}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/affected-families?search=AF-0011")
        fam_id = res.json()["data"][0]["id"]

        # Update eligibility to APPROVED
        patch_res = await client.patch(
            f"/api/v1/affected-families/{fam_id}/eligibility",
            headers=headers,
            json={
                "eligibility_status": "APPROVED",
                "eligibility_category": "SCHEDULE_II_BENEFICIARY",
                "assessing_authority": "CALA & ADM (Land Acquisition), Jaipur",
                "eligibility_basis": "Statutory verification complete under RFCTLARR Second Schedule.",
                "eligibility_remarks": "Approved following joint survey and title review.",
            },
        )
        assert patch_res.status_code == 200
        data = patch_res.json()["data"]
        assert data["eligibility_status"] == "APPROVED"
        assert data["eligibility_category"] == "SCHEDULE_II_BENEFICIARY"

        # Verify detail reflected
        detail_res = await client.get(f"/api/v1/affected-families/{fam_id}")
        assert detail_res.json()["data"]["eligibility_status"] == "APPROVED"


@pytest.mark.asyncio
async def test_create_allotment_and_status():
    """Verify recording an R&R allotment updates family rehabilitation status."""
    token = await get_auth_token("cala_jaipur")
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {token}"}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/affected-families?search=AF-0008")
        fam_id = res.json()["data"][0]["id"]

        allot_res = await client.post(
            f"/api/v1/affected-families/{fam_id}/allotments",
            headers=headers,
            json={
                "family_id": fam_id,
                "entitlement_category": "HOUSING_RESETTLEMENT",
                "allotment_type": "PLOT",
                "asset_identifier": "Plot B-16, Sector 4 Enclave",
                "allotment_order_no": "CALA/RR/2026/ORD-150",
                "allotment_date": "2026-09-04",
                "allocated_value_inr": "1200000.00",
                "status": "ALLOTTED",
                "remarks": "Homestead plot allocated in model resettlement colony.",
            },
        )
        assert allot_res.status_code == 201
        data = allot_res.json()["data"]
        assert "allotment_reference" in data
        assert data["status"] == "ALLOTTED"

        # Verify family status transitioned to PLOT_ALLOTTED
        detail_res = await client.get(f"/api/v1/affected-families/{fam_id}")
        fam_detail = detail_res.json()["data"]
        assert fam_detail["rehabilitation_status"] == "PLOT_ALLOTTED"
        assert fam_detail["allotted_plot_number"] == "Plot B-16, Sector 4 Enclave"


@pytest.mark.asyncio
async def test_dashboard_randr_integration():
    """Verify GET /api/v1/dashboard/public-summary includes R&R KPIs and progress stages."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/dashboard/public-summary")
        assert res.status_code == 200
        body = res.json()["data"]
        assert "randr_overview" in body
        rr = body["randr_overview"]
        assert rr is not None
        assert rr["total_affected_families"] >= 18
        assert rr["eligible_families"] >= 10
        assert "progress_stages" in rr
        assert len(rr["progress_stages"]) == 5
        stages = [s["stage"] for s in rr["progress_stages"]]
        assert "Eligible" in stages
        assert "Completed" in stages
