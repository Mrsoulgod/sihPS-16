import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_list_and_get_possession_records():
    """Test GET /api/v1/possession and Section 38 compliance checks."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/possession")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        items = data["data"]
        assert len(items) >= 2

        possession_id = items[0]["id"]
        detail_res = await client.get(f"/api/v1/possession/{possession_id}")
        assert detail_res.status_code == 200
        detail = detail_res.json()["data"]
        assert detail["id"] == possession_id
        assert "prerequisite_checks" in detail
        assert len(detail["prerequisite_checks"]) == 4
        # Verify check names
        check_names = [c["check_name"] for c in detail["prerequisite_checks"]]
        assert any("Award" in name for name in check_names)
        assert any("Disbursement" in name for name in check_names)
