import pytest
from decimal import Decimal
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.compensation_service import CompensationService


@pytest.mark.asyncio
async def test_configurable_compensation_calculation():
    """Test pure configurable calculation logic with 100% Solatium and 12% statutory additional amount."""
    breakdown = CompensationService.calculate_configurable_breakdown(
        area_sqm=Decimal("10000.00"),
        circle_rate_per_sqm=Decimal("1500.00"),
        multiplier_factor=Decimal("1.25"),
        assets_value_inr=Decimal("500000.00"),
        solatium_percent=Decimal("100.0"),
        statutory_additional_rate_percent=Decimal("12.0"),
    )

    # Base Land = 10,000 * 1,500 = 15,000,000.00
    assert breakdown.base_land_value_inr == Decimal("15000000.00")
    # Market Land = 15,000,000 * 1.25 = 18,750,000.00
    assert breakdown.market_value_land_inr == Decimal("18750000.00")
    # Assets = 500,000.00
    assert breakdown.assets_value_inr == Decimal("500000.00")
    # Solatium = (18,750,000 + 500,000) * 100% = 19,250,000.00
    assert breakdown.solatium_inr == Decimal("19250000.00")
    # 12% Additional Market Value for 180 days = 18,750,000 * 0.12 * 180/365 = 1,109,589.04
    assert breakdown.additional_market_value_inr == Decimal("1109589.04")
    # Total = 18,750,000 + 500,000 + 19,250,000 + 1,109,589.04 = 39,609,589.04
    assert breakdown.total_compensation_inr == Decimal("39609589.04")
    assert len(breakdown.components) == 5


@pytest.mark.asyncio
async def test_trial_calculation_endpoint():
    """Test POST /api/v1/compensation/calculate endpoint."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/compensation/calculate",
            json={
                "area_sqm": 5000.0,
                "circle_rate_per_sqm": 2000.0,
                "multiplier_factor": 1.2,
                "assets_value_inr": 200000.0,
                "solatium_percent": 100.0,
                "statutory_additional_rate_percent": 12.0,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        calc = data["data"]
        # Base = 10,000,000; Market = 12,000,000; Assets = 200,000; Solatium = 12,200,000
        assert calc["base_land_value_inr"] == "10000000.00"
        assert calc["market_value_land_inr"] == "12000000.00"
        assert calc["solatium_inr"] == "12200000.00"


@pytest.mark.asyncio
async def test_list_and_get_compensation_assessments():
    """Test GET /api/v1/compensation listing and detail with masked PII."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. List assessments
        list_res = await client.get("/api/v1/compensation")
        assert list_res.status_code == 200
        data = list_res.json()
        assert data["success"] is True
        items = data["data"]
        assert len(items) > 0

        first_id = items[0]["id"]

        # 2. Get detail
        detail_res = await client.get(f"/api/v1/compensation/{first_id}")
        assert detail_res.status_code == 200
        detail = detail_res.json()["data"]
        assert detail["id"] == first_id
        assert "breakdown" in detail
        assert "components" in detail["breakdown"]

        # Verify PII masking in owners
        if detail["owners"]:
            for owner in detail["owners"]:
                assert "•" in owner["masked_bank_account"]
                assert "•" in owner["masked_bank_ifsc"]
