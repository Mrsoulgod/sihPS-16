import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_list_and_get_awards():
    """Test GET /api/v1/awards and /api/v1/awards/{id}."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/awards")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        items = data["data"]
        assert len(items) >= 2

        award_id = items[0]["id"]
        detail_res = await client.get(f"/api/v1/awards/{award_id}")
        assert detail_res.status_code == 200
        detail = detail_res.json()["data"]
        assert detail["id"] == award_id
        assert detail["approval_stamp_label"] == "Demo e-Sign / Approval Stamp (Simulation)"
        assert len(detail["parcels"]) > 0
        assert float(detail["total_award_amount_inr"]) > 0
