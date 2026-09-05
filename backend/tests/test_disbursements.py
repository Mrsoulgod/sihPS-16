import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_list_and_get_disbursements_with_masked_pii():
    """Test GET /api/v1/disbursements and PII masking."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/disbursements")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        items = data["data"]
        assert len(items) >= 4

        # Validate that all list items have masked bank account and IFSC
        for item in items:
            assert "•" in item["masked_bank_account"]
            assert "•" in item["masked_ifsc"]

        first_id = items[0]["id"]
        detail_res = await client.get(f"/api/v1/disbursements/{first_id}")
        assert detail_res.status_code == 200
        detail = detail_res.json()["data"]
        assert detail["id"] == first_id
        assert detail["payment_workflow_label"] == "PFMS-Compatible / Simulated Payment Workflow"
        assert "•" in detail["masked_bank_account"]


@pytest.mark.asyncio
async def test_financial_reconciliation_summary():
    """Test GET /api/v1/disbursements/summary/{award_or_project_id}."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Fetch an award to reconcile
        awards_res = await client.get("/api/v1/awards")
        award_id = awards_res.json()["data"][0]["id"]

        recon_res = await client.get(f"/api/v1/disbursements/summary/{award_id}")
        assert recon_res.status_code == 200
        recon = recon_res.json()["data"]
        assert float(recon["total_awarded_inr"]) > 0
        assert float(recon["total_disbursed_inr"]) <= float(recon["total_awarded_inr"])
        assert float(recon["outstanding_inr"]) >= 0
        assert recon["reconciliation_status"] == "BALANCED"
