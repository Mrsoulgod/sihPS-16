import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings
from app.services.risk_service import RiskService
from app.models.project import Project
from decimal import Decimal


async def get_token_for(client: AsyncClient, email: str = "admin@gov.demo") -> str:
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": email, "password": settings.DEMO_USER_PASSWORD},
    )
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_risk_overview():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "admin@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}
        resp = await client.get("/api/v1/risk/overview", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        ov = data["data"]

        assert "distribution" in ov
        dist = ov["distribution"]
        assert dist["total_projects"] >= 1
        assert (dist["low_count"] + dist["moderate_count"] + dist["high_count"] + dist["critical_count"]) == dist["total_projects"]

        assert "top_high_risk_projects" in ov
        assert "factor_benchmarks" in ov
        assert len(ov["factor_benchmarks"]) == 5


@pytest.mark.asyncio
async def test_project_risk_detail():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "admin@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}
        
        proj_resp = await client.get("/api/v1/projects", headers=headers)
        assert proj_resp.status_code == 200
        p_data = proj_resp.json()
        if isinstance(p_data, dict):
            p_raw = p_data.get("data")
            projects = p_raw.get("items", []) if isinstance(p_raw, dict) else (p_raw if isinstance(p_raw, list) else [])
        elif isinstance(p_data, list):
            projects = p_data
        else:
            projects = []
        assert len(projects) >= 1
        target_pid = projects[0]["id"]

        resp = await client.get(f"/api/v1/risk/projects/{target_pid}", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        detail = data["data"]

        assert "overall_risk_score" in detail
        assert 0 <= detail["overall_risk_score"] <= 100
        assert detail["risk_level"] in ("LOW", "MODERATE", "HIGH", "CRITICAL")
        assert len(detail["factors"]) == 5

        # Check that weights sum to 100%
        total_weights = sum(f["weight_percent"] for f in detail["factors"])
        assert total_weights == 100.0

        assert len(detail["top_risk_drivers"]) >= 1
        assert len(detail["decision_support_recommendations"]) >= 1


def test_deterministic_risk_calculation():
    """Verify that identical inputs produce identical, deterministic risk scores and factor contributions."""
    mock_project = Project(
        project_code="TEST-NH-01",
        title="Test National Highway",
        description="Test",
        sponsoring_ministry="MORTH",
        implementing_agency="NHAI",
        current_stage="SECTION_19_DECLARATION",
        total_land_proposed_acres=Decimal("500.0"),
        total_land_acquired_acres=Decimal("420.0"),
        total_possession_acres=Decimal("395.0"),
        estimated_budget_inr_cr=Decimal("800.0"),
        compensation_assessed_cr=Decimal("620.0"),
        compensation_disbursed_cr=Decimal("570.0"),
        total_paf_count=1240,
        total_pdf_count=380,
        randr_completion_percent=Decimal("78.0"),
        risk_score=35,
    )
    mock_project.parcels = []

    factors1, score1, level1, drivers1, recs1 = RiskService.calculate_project_risk_factors(
        mock_project,
        overdue_tasks_count=2,
        disputed_parcels_count=1,
        unverified_parcels_count=0,
        pending_objections_count=1,
    )

    factors2, score2, level2, drivers2, recs2 = RiskService.calculate_project_risk_factors(
        mock_project,
        overdue_tasks_count=2,
        disputed_parcels_count=1,
        unverified_parcels_count=0,
        pending_objections_count=1,
    )

    assert score1 == score2
    assert level1 == level2
    assert len(factors1) == len(factors2)
    for f1, f2 in zip(factors1, factors2):
        assert f1.score == f2.score
        assert f1.weighted_contribution == f2.weighted_contribution


def test_risk_factors_weight_integrity():
    """Verify that statutory risk factor weights always total precisely 100%."""
    mock_project = Project(
        project_code="TEST-NH-02",
        title="Test National Highway 2",
        description="Test",
        sponsoring_ministry="MORTH",
        implementing_agency="NHAI",
        current_stage="PRELIMINARY_SURVEY",
        total_land_proposed_acres=Decimal("100.0"),
        total_land_acquired_acres=Decimal("0.0"),
        total_possession_acres=Decimal("0.0"),
        estimated_budget_inr_cr=Decimal("100.0"),
        compensation_assessed_cr=Decimal("0.0"),
        compensation_disbursed_cr=Decimal("0.0"),
        total_paf_count=0,
        total_pdf_count=0,
        randr_completion_percent=Decimal("0.0"),
    )
    mock_project.parcels = []

    factors, score, level, drivers, recs = RiskService.calculate_project_risk_factors(mock_project)
    total_weight = sum(f.weight_percent for f in factors)
    assert total_weight == 100.0
    assert 0 <= score <= 100
    assert level in ("LOW", "MODERATE", "HIGH", "CRITICAL")


def test_risk_critical_indicators():
    """Verify that severe overdue tasks and high dispute ratios elevate the risk level."""
    mock_project = Project(
        project_code="TEST-NH-CRITICAL",
        title="Critical Delayed Project",
        description="Severely delayed project with disputes",
        sponsoring_ministry="MORTH",
        implementing_agency="NHAI",
        current_stage="COMPENSATION_DETERMINATION",
        total_land_proposed_acres=Decimal("500.0"),
        total_land_acquired_acres=Decimal("50.0"),
        total_possession_acres=Decimal("0.0"),
        estimated_budget_inr_cr=Decimal("1000.0"),
        compensation_assessed_cr=Decimal("900.0"),
        compensation_disbursed_cr=Decimal("50.0"),
        total_paf_count=1000,
        total_pdf_count=400,
        randr_completion_percent=Decimal("5.0"),
    )
    mock_project.parcels = []

    factors, score, level, drivers, recs = RiskService.calculate_project_risk_factors(
        mock_project,
        overdue_tasks_count=10,
        disputed_parcels_count=8,
        unverified_parcels_count=15,
        pending_objections_count=12,
    )

    assert score >= 50
    assert level in ("HIGH", "CRITICAL")
    assert len(drivers) >= 2
    assert len(recs) >= 1
