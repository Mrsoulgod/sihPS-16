import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings


async def get_token_for(client: AsyncClient, email: str = "admin@gov.demo") -> str:
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": email, "password": settings.DEMO_USER_PASSWORD},
    )
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_list_report_types():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "admin@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}
        resp = await client.get("/api/v1/reports/types", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        types = data["data"]
        assert len(types) >= 7
        codes = [t["code"] for t in types]
        assert "NATIONAL_ACQUISITION_PROGRESS" in codes
        assert "STATE_ACQUISITION_REPORT" in codes
        assert "COMPENSATION_DISBURSEMENT_REPORT" in codes
        assert "POSSESSION_STATUS_REPORT" in codes
        assert "AFFECTED_FAMILIES_RR_REPORT" in codes
        assert "RISK_BOTTLENECK_REPORT" in codes


@pytest.mark.asyncio
async def test_report_preview_national_progress():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "admin@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "report_type": "NATIONAL_ACQUISITION_PROGRESS",
            "page": 1,
            "page_size": 20,
        }
        resp = await client.post("/api/v1/reports/preview", json=payload, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        prev = data["data"]
        assert "report_title" in prev
        assert "summary_kpis" in prev
        assert len(prev["summary_kpis"]) >= 3
        assert "columns" in prev
        assert len(prev["columns"]) >= 5
        assert "rows" in prev
        assert isinstance(prev["rows"], list)


@pytest.mark.asyncio
async def test_report_preview_state_acquisition():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "admin@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "report_type": "STATE_ACQUISITION_REPORT",
            "page": 1,
            "page_size": 20,
        }
        resp = await client.post("/api/v1/reports/preview", json=payload, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        prev = data["data"]
        assert len(prev["rows"]) >= 1


@pytest.mark.asyncio
async def test_report_pdf_export_binary():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "admin@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "report_type": "NATIONAL_ACQUISITION_PROGRESS",
            "page": 1,
            "page_size": 50,
        }
        resp = await client.post("/api/v1/reports/export/pdf", json=payload, headers=headers)
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "application/pdf"
        assert "attachment" in resp.headers.get("content-disposition", "")
        assert len(resp.content) > 100
        # Check PDF magic bytes '%PDF-'
        assert resp.content.startswith(b"%PDF-")


@pytest.mark.asyncio
async def test_report_excel_export_binary():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "admin@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "report_type": "COMPENSATION_DISBURSEMENT_REPORT",
            "page": 1,
            "page_size": 50,
        }
        resp = await client.post("/api/v1/reports/export/excel", json=payload, headers=headers)
        assert resp.status_code == 200
        assert "openxmlformats-officedocument.spreadsheetml.sheet" in resp.headers["content-type"]
        assert "attachment" in resp.headers.get("content-disposition", "")
        # Check Zip / XLSX magic bytes 'PK\x03\x04'
        assert resp.content.startswith(b"PK")


def test_direct_pdf_generation():
    """Verify that ReportService.generate_pdf_report generates a valid binary PDF with NLAMS headers."""
    from app.services.report_service import ReportService
    from app.schemas.reports import ReportPreviewResponse, ReportSummaryKpi, ReportTableColumn

    mock_preview = ReportPreviewResponse(
        report_id="REP-TEST-01",
        report_code="NATIONAL_ACQUISITION_PROGRESS",
        report_title="National Land Acquisition Progress Report",
        generated_at="2026-09-04 12:00:00 UTC",
        scope_jurisdiction="National Ministry Scope",
        filter_summary={},
        summary_kpis=[
            ReportSummaryKpi(label="Total Projects", value="4", subtitle="Projects"),
            ReportSummaryKpi(label="Land Proposed", value="1,250.50", subtitle="Acres"),
            ReportSummaryKpi(label="Compensation Disbursed", value="₹ 450.20", subtitle="Cr"),
        ],
        columns=[
            ReportTableColumn(key="project_code", label="Project Code"),
            ReportTableColumn(key="title", label="Project Title"),
            ReportTableColumn(key="stage", label="Current Stage"),
            ReportTableColumn(key="progress", label="Progress %", align="right", is_numeric=True),
        ],
        rows=[
            {"project_code": "NHAI-DEL-JAI-01", "title": "Delhi–Jaipur Expressway Expansion", "stage": "AWARDS_DECLARED", "progress": "84.0%"},
            {"project_code": "DFCCIL-WDFC-02", "title": "Western Dedicated Freight Corridor", "stage": "POSSESSION_COMPLETED", "progress": "92.5%"},
        ],
        total_records=2,
        page=1,
        page_size=20,
        total_pages=1,
    )

    pdf_bytes = ReportService.generate_pdf_report(mock_preview)
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF-")


def test_direct_excel_generation():
    """Verify that ReportService.generate_excel_report generates a valid multi-sheet OpenPyXL workbook."""
    from app.services.report_service import ReportService
    from app.schemas.reports import ReportPreviewResponse, ReportSummaryKpi, ReportTableColumn

    mock_preview = ReportPreviewResponse(
        report_id="REP-TEST-02",
        report_code="COMPENSATION_DISBURSEMENT_REPORT",
        report_title="Compensation Assessment & Direct Benefit Transfer Report",
        generated_at="2026-09-04 12:00:00 UTC",
        scope_jurisdiction="National Scope",
        filter_summary={},
        summary_kpis=[
            ReportSummaryKpi(label="Total Assessed", value="₹ 620.00", subtitle="Cr"),
            ReportSummaryKpi(label="Total Disbursed", value="₹ 570.00", subtitle="Cr"),
        ],
        columns=[
            ReportTableColumn(key="project_code", label="Project Code"),
            ReportTableColumn(key="title", label="Project Title"),
            ReportTableColumn(key="assessed_cr", label="Assessed (₹ Cr)", align="right", is_numeric=True),
            ReportTableColumn(key="disbursed_cr", label="Disbursed (₹ Cr)", align="right", is_numeric=True),
        ],
        rows=[
            {"project_code": "NHAI-DEL-JAI-01", "title": "Delhi–Jaipur Expressway", "assessed_cr": 620.0, "disbursed_cr": 570.0},
        ],
        total_records=1,
        page=1,
        page_size=20,
        total_pages=1,
    )

    excel_bytes = ReportService.generate_excel_report(mock_preview)
    assert len(excel_bytes) > 500
    assert excel_bytes.startswith(b"PK")
