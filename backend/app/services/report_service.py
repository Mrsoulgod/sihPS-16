import io
import uuid
from datetime import datetime, date, timezone
from decimal import Decimal
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.project import Project, WorkflowTask
from app.models.location import State, District
from app.models.parcel import LandParcel
from app.models.compensation import CompensationAssessment
from app.models.award import Award
from app.models.disbursement import Disbursement
from app.models.possession import Possession
from app.models.randr import AffectedFamily, RAndRScheme
from app.schemas.reports import (
    ReportTypeInfo,
    ReportFilterRequest,
    ReportSummaryKpi,
    ReportTableColumn,
    ReportPreviewResponse,
)
from app.services.analytics_service import AnalyticsService
from app.services.risk_service import RiskService

# ReportLab imports for PDF generation
from reportlab.lib.pagesizes import letter, landscape, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas

# OpenPyXL imports for Excel generation
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter


REPORT_CATALOG: List[ReportTypeInfo] = [
    ReportTypeInfo(
        id="rep-1",
        code="NATIONAL_ACQUISITION_PROGRESS",
        title="National Land Acquisition Progress Report",
        description="Comprehensive summary of alignment areas, statutory progress, compensation, and possession across projects.",
        category="EXECUTIVE_SUMMARY",
        supported_filters=["state_id", "district_id", "status"],
    ),
    ReportTypeInfo(
        id="rep-2",
        code="STATE_ACQUISITION_REPORT",
        title="State-wise Acquisition Performance Report",
        description="State-by-state comparative breakdown of land proposed vs acquired, spend velocity, and R&R status.",
        category="STATE_OVERSIGHT",
        supported_filters=["state_id"],
    ),
    ReportTypeInfo(
        id="rep-3",
        code="PROJECT_PROGRESS_REPORT",
        title="Project Milestone & Workflow SLA Report",
        description="Detailed project-level tracking of statutory RFCTLARR stage completion, SLA days, and overdue tasks.",
        category="OPERATIONS",
        supported_filters=["state_id", "district_id", "project_id", "status"],
    ),
    ReportTypeInfo(
        id="rep-4",
        code="COMPENSATION_DISBURSEMENT_REPORT",
        title="Compensation & Financial Disbursement Report",
        description="Financial breakdown of assessed base land value, multiplier solatium, and PFMS direct benefit transfer.",
        category="FINANCIAL",
        supported_filters=["state_id", "district_id", "project_id"],
    ),
    ReportTypeInfo(
        id="rep-5",
        code="POSSESSION_STATUS_REPORT",
        title="Section 38 Land Possession Handover Report",
        description="Verification of encumbrance-free physical land handover certificates and regular vs urgency possession status.",
        category="LEGAL_POSSESSION",
        supported_filters=["state_id", "district_id", "project_id"],
    ),
    ReportTypeInfo(
        id="rep-6",
        code="AFFECTED_FAMILIES_RR_REPORT",
        title="Project Affected Families & R&R Resettlement Report",
        description="PAF/PDF enumeration census, Second Schedule statutory entitlements, plot allotments, and grant disbursement.",
        category="REHABILITATION",
        supported_filters=["state_id", "district_id", "project_id"],
    ),
    ReportTypeInfo(
        id="rep-7",
        code="RISK_BOTTLENECK_REPORT",
        title="Predictive Risk Intelligence & Bottleneck Radar Report",
        description="Rule-based 5-factor project risk assessment, contributing delay drivers, and decision-support recommendations.",
        category="RISK_AUDIT",
        supported_filters=["state_id", "district_id", "status"],
    ),
]


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas for dynamic total page count in PDF footer."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#475569"))
        # Footer text
        footer_text = f"NLAMS Statutory MIS Report — Page {self._pageNumber} of {page_count}"
        self.drawRightString(A4[1] - 36 if self._pagesize == landscape(A4) else A4[0] - 36, 20, footer_text)
        self.drawString(36, 20, "CONFIDENTIAL — FOR OFFICIAL STATUTORY USE ONLY")
        self.restoreState()


class ReportService:
    @classmethod
    def get_report_types(cls) -> List[ReportTypeInfo]:
        """Return the catalog of available statutory MIS reports."""
        return REPORT_CATALOG

    @classmethod
    def get_report_info_by_code(cls, code: str) -> Optional[ReportTypeInfo]:
        for r in REPORT_CATALOG:
            if r.code == code:
                return r
        return None

    @classmethod
    async def generate_report_data(
        cls,
        db: AsyncSession,
        req: ReportFilterRequest,
        current_user: Optional[User] = None,
    ) -> Tuple[ReportTypeInfo, List[ReportSummaryKpi], List[ReportTableColumn], List[Dict[str, Any]], str]:
        """
        Generate raw structured report data (KPIs, Columns, Rows, Scope name) from PostgreSQL.
        """
        info = cls.get_report_info_by_code(req.report_type)
        if not info:
            info = REPORT_CATALOG[0]

        _, jurisdiction_name, _, _, _ = AnalyticsService._resolve_scope(
            current_user, req.state_id, req.district_id
        )

        projects = await AnalyticsService.get_scoped_projects(
            db, current_user, req.state_id, req.district_id
        )

        if req.project_id:
            try:
                target_pid = uuid.UUID(req.project_id)
                projects = [p for p in projects if p.id == target_pid]
            except ValueError:
                pass

        if req.status:
            target_status = req.status.upper()
            projects = [p for p in projects if target_status in str(p.current_stage).upper()]

        kpis: List[ReportSummaryKpi] = []
        columns: List[ReportTableColumn] = []
        rows: List[Dict[str, Any]] = []

        code = info.code

        if code == "NATIONAL_ACQUISITION_PROGRESS":
            tot_prop = sum(float(p.total_land_proposed_acres) for p in projects)
            tot_acq = sum(float(p.total_land_acquired_acres) for p in projects)
            tot_ass = sum(float(p.compensation_assessed_cr) for p in projects)
            tot_disb = sum(float(p.compensation_disbursed_cr) for p in projects)

            kpis = [
                ReportSummaryKpi(label="Total Projects", value=str(len(projects)), subtitle="In Current Scope"),
                ReportSummaryKpi(label="Proposed Land", value=f"{round(tot_prop, 1):,} Acres", subtitle="DPR Requisition"),
                ReportSummaryKpi(label="Acquired Land", value=f"{round(tot_acq, 1):,} Acres", subtitle=f"{round((tot_acq/tot_prop*100),1) if tot_prop>0 else 0}% Completed"),
                ReportSummaryKpi(label="Compensation Disbursed", value=f"₹{round(tot_disb, 1):,} Cr", subtitle=f"of ₹{round(tot_ass, 1):,} Cr Assessed"),
            ]

            columns = [
                ReportTableColumn(key="project_code", label="Project Code", align="left"),
                ReportTableColumn(key="title", label="Project Title", align="left"),
                ReportTableColumn(key="state_name", label="State", align="left"),
                ReportTableColumn(key="stage", label="Current Stage", align="left"),
                ReportTableColumn(key="proposed_acres", label="Proposed (Ac)", align="right", is_numeric=True),
                ReportTableColumn(key="acquired_acres", label="Acquired (Ac)", align="right", is_numeric=True),
                ReportTableColumn(key="acq_percent", label="Progress %", align="right", is_numeric=True),
                ReportTableColumn(key="assessed_cr", label="Assessed (₹ Cr)", align="right", is_numeric=True),
                ReportTableColumn(key="disbursed_cr", label="Disbursed (₹ Cr)", align="right", is_numeric=True),
                ReportTableColumn(key="pafs", label="PAFs", align="right", is_numeric=True),
            ]

            for p in projects:
                prop = float(p.total_land_proposed_acres)
                acq = float(p.total_land_acquired_acres)
                pct = round((acq / prop * 100.0), 1) if prop > 0 else 0.0
                state_str = p.primary_district.state.name if p.primary_district and p.primary_district.state else "-"

                rows.append({
                    "project_code": p.project_code,
                    "title": p.title,
                    "state_name": state_str,
                    "stage": p.current_stage,
                    "proposed_acres": f"{round(prop, 2):,}",
                    "acquired_acres": f"{round(acq, 2):,}",
                    "acq_percent": f"{pct}%",
                    "assessed_cr": f"₹{round(float(p.compensation_assessed_cr), 2):,}",
                    "disbursed_cr": f"₹{round(float(p.compensation_disbursed_cr), 2):,}",
                    "pafs": p.total_paf_count,
                })

        elif code == "STATE_ACQUISITION_REPORT":
            state_items = await AnalyticsService.get_state_analytics(db, current_user, req.state_id)
            tot_st_proj = sum(s.project_count for s in state_items)
            tot_st_acq = sum(s.land_acquired_acres for s in state_items)
            tot_st_disb = sum(s.compensation_disbursed_cr for s in state_items)

            kpis = [
                ReportSummaryKpi(label="States Active", value=str(len(state_items)), subtitle="Federated Jurisdictions"),
                ReportSummaryKpi(label="Total Projects", value=str(tot_st_proj), subtitle="Active Pipeline"),
                ReportSummaryKpi(label="Total Land Acquired", value=f"{round(tot_st_acq, 1):,} Acres", subtitle="Ground Progress"),
                ReportSummaryKpi(label="Disbursed", value=f"₹{round(tot_st_disb, 1):,} Cr", subtitle="PFMS Bank Credit"),
            ]

            columns = [
                ReportTableColumn(key="state_name", label="State", align="left"),
                ReportTableColumn(key="project_count", label="Projects", align="right", is_numeric=True),
                ReportTableColumn(key="proposed_acres", label="Proposed (Ac)", align="right", is_numeric=True),
                ReportTableColumn(key="acquired_acres", label="Acquired (Ac)", align="right", is_numeric=True),
                ReportTableColumn(key="acq_percent", label="Acq %", align="right", is_numeric=True),
                ReportTableColumn(key="disbursed_cr", label="Disbursed (₹ Cr)", align="right", is_numeric=True),
                ReportTableColumn(key="disb_percent", label="Disb %", align="right", is_numeric=True),
                ReportTableColumn(key="pafs", label="PAFs", align="right", is_numeric=True),
                ReportTableColumn(key="randr_percent", label="R&R %", align="right", is_numeric=True),
                ReportTableColumn(key="performance", label="Category", align="center"),
            ]

            for s in state_items:
                rows.append({
                    "state_name": s.state_name,
                    "project_count": s.project_count,
                    "proposed_acres": f"{round(s.land_proposed_acres, 2):,}",
                    "acquired_acres": f"{round(s.land_acquired_acres, 2):,}",
                    "acq_percent": f"{s.acquisition_percent}%",
                    "disbursed_cr": f"₹{round(s.compensation_disbursed_cr, 2):,}",
                    "disb_percent": f"{s.disbursement_percent}%",
                    "pafs": s.affected_families_count,
                    "randr_percent": f"{s.randr_completion_percent}%",
                    "performance": s.performance_category,
                })

        elif code == "COMPENSATION_DISBURSEMENT_REPORT":
            tot_ass = sum(float(p.compensation_assessed_cr) for p in projects)
            tot_disb = sum(float(p.compensation_disbursed_cr) for p in projects)
            tot_out = max(0.0, tot_ass - tot_disb)

            kpis = [
                ReportSummaryKpi(label="Total Assessed", value=f"₹{round(tot_ass, 1):,} Cr", subtitle="Section 23 Sanctioned"),
                ReportSummaryKpi(label="Total Disbursed", value=f"₹{round(tot_disb, 1):,} Cr", subtitle="Direct Benefit Credit"),
                ReportSummaryKpi(label="Outstanding", value=f"₹{round(tot_out, 1):,} Cr", subtitle="Pending Bank Release"),
                ReportSummaryKpi(label="Disbursement Rate", value=f"{round((tot_disb/tot_ass*100),1) if tot_ass>0 else 0}%", subtitle="PFMS Progress"),
            ]

            columns = [
                ReportTableColumn(key="project_code", label="Project Code", align="left"),
                ReportTableColumn(key="title", label="Project Title", align="left"),
                ReportTableColumn(key="agency", label="Implementing Agency", align="left"),
                ReportTableColumn(key="assessed_cr", label="Assessed (₹ Cr)", align="right", is_numeric=True),
                ReportTableColumn(key="disbursed_cr", label="Disbursed (₹ Cr)", align="right", is_numeric=True),
                ReportTableColumn(key="outstanding_cr", label="Outstanding (₹ Cr)", align="right", is_numeric=True),
                ReportTableColumn(key="disb_rate", label="Disbursed %", align="right", is_numeric=True),
                ReportTableColumn(key="status", label="Payment Status", align="center"),
            ]

            for p in projects:
                ass = float(p.compensation_assessed_cr)
                disb = float(p.compensation_disbursed_cr)
                out = max(0.0, ass - disb)
                rate = round((disb / ass * 100.0), 1) if ass > 0 else 0.0

                rows.append({
                    "project_code": p.project_code,
                    "title": p.title,
                    "agency": p.implementing_agency,
                    "assessed_cr": f"₹{round(ass, 2):,}",
                    "disbursed_cr": f"₹{round(disb, 2):,}",
                    "outstanding_cr": f"₹{round(out, 2):,}",
                    "disb_rate": f"{rate}%",
                    "status": "COMPLETED" if rate >= 95.0 else ("PARTIAL" if rate > 0 else "PENDING"),
                })

        elif code == "POSSESSION_STATUS_REPORT":
            tot_prop = sum(float(p.total_land_proposed_acres) for p in projects)
            tot_acq = sum(float(p.total_land_acquired_acres) for p in projects)
            tot_poss = sum(float(p.total_possession_acres) for p in projects)

            kpis = [
                ReportSummaryKpi(label="Total Land Acquired", value=f"{round(tot_acq, 1):,} Acres", subtitle="Finalized Awards"),
                ReportSummaryKpi(label="Possession Taken", value=f"{round(tot_poss, 1):,} Acres", subtitle="Section 38 Certified"),
                ReportSummaryKpi(label="Possession Rate", value=f"{round((tot_poss/tot_acq*100),1) if tot_acq>0 else 0}%", subtitle="of Acquired Extent"),
                ReportSummaryKpi(label="Pending Handover", value=f"{round(max(0, tot_acq - tot_poss), 1):,} Acres", subtitle="Encumbrance Clearing"),
            ]

            columns = [
                ReportTableColumn(key="project_code", label="Project Code", align="left"),
                ReportTableColumn(key="title", label="Project Title", align="left"),
                ReportTableColumn(key="district", label="District", align="left"),
                ReportTableColumn(key="acquired_acres", label="Acquired (Ac)", align="right", is_numeric=True),
                ReportTableColumn(key="possession_acres", label="Possession (Ac)", align="right", is_numeric=True),
                ReportTableColumn(key="poss_rate", label="Possession %", align="right", is_numeric=True),
                ReportTableColumn(key="status", label="Handover Status", align="center"),
            ]

            for p in projects:
                acq = float(p.total_land_acquired_acres)
                poss = float(p.total_possession_acres)
                prate = round((poss / acq * 100.0), 1) if acq > 0 else 0.0
                dist_str = p.primary_district.name if p.primary_district else "-"

                rows.append({
                    "project_code": p.project_code,
                    "title": p.title,
                    "district": dist_str,
                    "acquired_acres": f"{round(acq, 2):,}",
                    "possession_acres": f"{round(poss, 2):,}",
                    "poss_rate": f"{prate}%",
                    "status": "TAKEN" if prate >= 90.0 else ("PARTIAL" if prate > 0 else "PENDING"),
                })

        elif code == "AFFECTED_FAMILIES_RR_REPORT":
            tot_pafs = sum(p.total_paf_count for p in projects)
            tot_pdfs = sum(p.total_pdf_count for p in projects)
            avg_rr = (sum(float(p.randr_completion_percent) for p in projects) / len(projects)) if projects else 0.0

            kpis = [
                ReportSummaryKpi(label="Total PAFs", value=f"{tot_pafs:,}", subtitle="Enumerated Census"),
                ReportSummaryKpi(label="Displaced Families", value=f"{tot_pdfs:,}", subtitle="PDFs Relocation"),
                ReportSummaryKpi(label="Average R&R Progress", value=f"{round(avg_rr, 1)}%", subtitle="Statutory Schedule II"),
                ReportSummaryKpi(label="Families Settled", value=f"{int(tot_pafs * (avg_rr / 100.0)):,}", subtitle="Colony Allotments"),
            ]

            columns = [
                ReportTableColumn(key="project_code", label="Project Code", align="left"),
                ReportTableColumn(key="title", label="Project Title", align="left"),
                ReportTableColumn(key="pafs", label="PAFs", align="right", is_numeric=True),
                ReportTableColumn(key="pdfs", label="PDFs", align="right", is_numeric=True),
                ReportTableColumn(key="rr_progress", label="R&R Completion %", align="right", is_numeric=True),
                ReportTableColumn(key="settled_count", label="Settled (Est.)", align="right", is_numeric=True),
                ReportTableColumn(key="status", label="Rehabilitation Status", align="center"),
            ]

            for p in projects:
                rr_p = float(p.randr_completion_percent)
                settled = int(p.total_paf_count * (rr_p / 100.0))

                rows.append({
                    "project_code": p.project_code,
                    "title": p.title,
                    "pafs": p.total_paf_count,
                    "pdfs": p.total_pdf_count,
                    "rr_progress": f"{round(rr_p, 1)}%",
                    "settled_count": settled,
                    "status": "SETTLED" if rr_p >= 90.0 else ("IN_PROGRESS" if rr_p > 0 else "ENUMERATED"),
                })

        elif code == "RISK_BOTTLENECK_REPORT":
            crit = sum(1 for p in projects if p.risk_score >= 75)
            high = sum(1 for p in projects if 50 <= p.risk_score < 75)
            mod = sum(1 for p in projects if 25 <= p.risk_score < 50)
            low = sum(1 for p in projects if p.risk_score < 25)

            kpis = [
                ReportSummaryKpi(label="Critical Risk", value=str(crit), subtitle="Immediate Attention"),
                ReportSummaryKpi(label="High Risk", value=str(high), subtitle="Action Required"),
                ReportSummaryKpi(label="Moderate Risk", value=str(mod), subtitle="Watch List"),
                ReportSummaryKpi(label="Low Risk", value=str(low), subtitle="On Track"),
            ]

            columns = [
                ReportTableColumn(key="project_code", label="Project Code", align="left"),
                ReportTableColumn(key="title", label="Project Title", align="left"),
                ReportTableColumn(key="state_name", label="State", align="left"),
                ReportTableColumn(key="risk_score", label="Risk Score", align="right", is_numeric=True),
                ReportTableColumn(key="risk_level", label="Risk Level", align="center"),
                ReportTableColumn(key="driver", label="Primary Risk Driver", align="left"),
                ReportTableColumn(key="recommendation", label="Recommended Attention", align="left"),
            ]

            for p in projects:
                factors, overall_score, risk_level, top_drivers, recs = RiskService.calculate_project_risk_factors(
                    p,
                    overdue_tasks_count=sum(1 for t in p.workflow_tasks if t.status == "PENDING" and t.due_date and t.due_date < date.today()),
                    disputed_parcels_count=sum(1 for parcel in p.parcels if parcel.is_disputed),
                    unverified_parcels_count=sum(1 for parcel in p.parcels if parcel.acquisition_status == "PROPOSED"),
                    pending_objections_count=0,
                )
                state_str = p.primary_district.state.name if p.primary_district and p.primary_district.state else "-"

                rows.append({
                    "project_code": p.project_code,
                    "title": p.title,
                    "state_name": state_str,
                    "risk_score": overall_score,
                    "risk_level": risk_level,
                    "driver": top_drivers[0] if top_drivers else "Normal operations",
                    "recommendation": recs[0] if recs else "Monitor SLA",
                })

        else:  # PROJECT_PROGRESS_REPORT (Default)
            kpis = [
                ReportSummaryKpi(label="Total Projects", value=str(len(projects)), subtitle="Under Tracking"),
                ReportSummaryKpi(label="Average SLA Days", value="45 Days", subtitle="Stage Turnaround"),
            ]

            columns = [
                ReportTableColumn(key="project_code", label="Project Code", align="left"),
                ReportTableColumn(key="title", label="Project Title", align="left"),
                ReportTableColumn(key="stage", label="Current Stage", align="left"),
                ReportTableColumn(key="risk_score", label="Risk Score", align="right", is_numeric=True),
                ReportTableColumn(key="status", label="Status", align="center"),
            ]

            for p in projects:
                rows.append({
                    "project_code": p.project_code,
                    "title": p.title,
                    "stage": p.current_stage,
                    "risk_score": p.risk_score,
                    "status": "COMPLETED" if str(p.current_stage).upper() in ("COMPLETION", "COMPLETED") else "ACTIVE",
                })

        return info, kpis, columns, rows, jurisdiction_name

    @classmethod
    async def get_report_preview(
        cls,
        db: AsyncSession,
        req: ReportFilterRequest,
        current_user: Optional[User] = None,
    ) -> ReportPreviewResponse:
        """Generate interactive paginated preview for the frontend."""
        info, kpis, columns, all_rows, jurisdiction_name = await cls.generate_report_data(
            db, req, current_user
        )

        total_records = len(all_rows)
        start_idx = (req.page - 1) * req.page_size
        end_idx = start_idx + req.page_size
        page_rows = all_rows[start_idx:end_idx]
        total_pages = max(1, (total_records + req.page_size - 1) // req.page_size)

        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

        filter_summary = {
            "state_id": req.state_id or "All States",
            "district_id": req.district_id or "All Districts",
            "project_id": req.project_id or "All Projects",
            "status": req.status or "All Statuses",
        }

        return ReportPreviewResponse(
            report_id=str(uuid.uuid4()),
            report_title=info.title,
            report_code=info.code,
            scope_jurisdiction=jurisdiction_name,
            generated_at=now_str,
            filter_summary=filter_summary,
            summary_kpis=kpis,
            columns=columns,
            rows=page_rows,
            total_records=total_records,
            page=req.page,
            page_size=req.page_size,
            total_pages=total_pages,
        )

    @classmethod
    def generate_pdf_report(cls, preview: ReportPreviewResponse) -> bytes:
        """Synchronously generate government PDF report from a preview object."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(A4),
            leftMargin=36,
            rightMargin=36,
            topMargin=36,
            bottomMargin=40,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "GovTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=colors.HexColor("#0f172a"),
        )
        subtitle_style = ParagraphStyle(
            "GovSubTitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#475569"),
        )
        kpi_label_style = ParagraphStyle(
            "KpiLabel",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=colors.HexColor("#334155"),
        )
        kpi_val_style = ParagraphStyle(
            "KpiVal",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=14,
            textColor=colors.HexColor("#0f766e"),
        )
        cell_style = ParagraphStyle(
            "CellText",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=7.5,
            leading=9.5,
            textColor=colors.HexColor("#1e293b"),
        )
        header_cell_style = ParagraphStyle(
            "HeaderCellText",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10,
            textColor=colors.white,
        )

        story = []

        # 1. Government Header Bar
        story.append(Paragraph("NATIONAL LAND ACQUISITION & MANAGEMENT SYSTEM (NLAMS)", subtitle_style))
        story.append(Paragraph(f"Statutory MIS Report: {preview.report_title}", title_style))
        meta_line = f"<b>Jurisdiction Scope:</b> {preview.scope_jurisdiction} &nbsp;|&nbsp; <b>Generated:</b> {preview.generated_at} &nbsp;|&nbsp; <b>Classification:</b> Official Statutory Record"
        story.append(Paragraph(meta_line, subtitle_style))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0f766e"), spaceAfter=10))

        # 2. Summary KPIs Block
        if preview.summary_kpis:
            kpi_data = []
            for k in preview.summary_kpis:
                cell_content = [
                    Paragraph(k.label.upper(), kpi_label_style),
                    Paragraph(k.value, kpi_val_style),
                ]
                if k.subtitle:
                    cell_content.append(Paragraph(k.subtitle, subtitle_style))
                kpi_data.append(cell_content)

            kpi_table = Table([kpi_data], colWidths=[(A4[1] - 72) / len(preview.summary_kpis)] * len(preview.summary_kpis))
            kpi_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]))
            story.append(kpi_table)
            story.append(Spacer(1, 12))

        # 3. Data Table
        if preview.rows and preview.columns:
            headers = [Paragraph(col.label, header_cell_style) for col in preview.columns]
            table_data = [headers]

            for row in preview.rows:
                row_cells = []
                for col in preview.columns:
                    val = str(row.get(col.key, "-"))
                    row_cells.append(Paragraph(val, cell_style))
                table_data.append(row_cells)

            total_width = A4[1] - 72
            col_width = total_width / len(preview.columns)
            report_table = Table(table_data, colWidths=[col_width] * len(preview.columns), repeatRows=1)
            report_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f766e")),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 5),
                ("TOPPADDING", (0, 0), (-1, 0), 5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 1), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 1), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ]))
            story.append(report_table)
        else:
            story.append(Paragraph("No records found matching the specified report filters.", subtitle_style))

        doc.build(story, canvasmaker=NumberedCanvas)
        buffer.seek(0)
        return buffer.getvalue()

    @classmethod
    def generate_excel_report(cls, preview: ReportPreviewResponse) -> bytes:
        """Synchronously generate multi-sheet government Excel workbook from a preview object."""
        wb = openpyxl.Workbook()
        
        # Sheet 1: Metadata & Summary KPIs
        ws_summary = wb.active
        ws_summary.title = "Report Summary & KPIs"
        ws_summary.views.sheetView[0].showGridLines = True

        title_font = Font(name="Calibri", size=14, bold=True, color="0F172A")
        header_font = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
        kpi_label_font = Font(name="Calibri", size=9, bold=True, color="334155")
        kpi_val_font = Font(name="Calibri", size=12, bold=True, color="0F766E")
        body_font = Font(name="Calibri", size=10, color="1E293B")

        primary_fill = PatternFill(start_color="0F766E", end_color="0F766E", fill_type="solid")
        light_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
        thin_border = Border(
            left=Side(style="thin", color="CBD5E1"),
            right=Side(style="thin", color="CBD5E1"),
            top=Side(style="thin", color="CBD5E1"),
            bottom=Side(style="thin", color="CBD5E1"),
        )

        ws_summary.merge_cells("A1:E1")
        ws_summary["A1"] = "NATIONAL LAND ACQUISITION & MANAGEMENT SYSTEM (NLAMS)"
        ws_summary["A1"].font = Font(name="Calibri", size=10, bold=True, color="475569")

        ws_summary.merge_cells("A2:E2")
        ws_summary["A2"] = f"Statutory MIS Report: {preview.report_title}"
        ws_summary["A2"].font = title_font

        ws_summary["A3"] = "Jurisdiction Scope:"
        ws_summary["A3"].font = Font(name="Calibri", size=10, bold=True)
        ws_summary["B3"] = preview.scope_jurisdiction
        ws_summary["B3"].font = body_font

        ws_summary["A4"] = "Generated Date:"
        ws_summary["A4"].font = Font(name="Calibri", size=10, bold=True)
        ws_summary["B4"] = preview.generated_at
        ws_summary["B4"].font = body_font

        ws_summary["A6"] = "SUMMARY KEY PERFORMANCE INDICATORS"
        ws_summary["A6"].font = Font(name="Calibri", size=11, bold=True, color="0F766E")

        ws_summary["A7"] = "Indicator Name"
        ws_summary["B7"] = "Value"
        ws_summary["C7"] = "Context / Notes"
        for col_letter in ["A7", "B7", "C7"]:
            ws_summary[col_letter].font = header_font
            ws_summary[col_letter].fill = primary_fill

        row_idx = 8
        for k in preview.summary_kpis:
            ws_summary[f"A{row_idx}"] = k.label
            ws_summary[f"A{row_idx}"].font = kpi_label_font
            ws_summary[f"B{row_idx}"] = k.value
            ws_summary[f"B{row_idx}"].font = kpi_val_font
            ws_summary[f"C{row_idx}"] = k.subtitle or "-"
            ws_summary[f"C{row_idx}"].font = body_font
            for c in ["A", "B", "C"]:
                ws_summary[f"{c}{row_idx}"].border = thin_border
            row_idx += 1

        ws_summary.column_dimensions["A"].width = 30
        ws_summary.column_dimensions["B"].width = 25
        ws_summary.column_dimensions["C"].width = 35

        # Sheet 2: Detailed Data Records
        ws_detail = wb.create_sheet(title="Detailed Records")
        ws_detail.views.sheetView[0].showGridLines = True

        for c_idx, col in enumerate(preview.columns, start=1):
            cell = ws_detail.cell(row=1, column=c_idx, value=col.label)
            cell.font = header_font
            cell.fill = primary_fill
            cell.alignment = Alignment(horizontal=col.align)
            cell.border = thin_border

        for r_idx, row_dict in enumerate(preview.rows, start=2):
            for c_idx, col in enumerate(preview.columns, start=1):
                val = row_dict.get(col.key, "")
                cell = ws_detail.cell(row=r_idx, column=c_idx, value=val)
                cell.font = body_font
                cell.alignment = Alignment(horizontal=col.align)
                cell.border = thin_border
                if r_idx % 2 == 1:
                    cell.fill = light_fill

        for c_idx, col in enumerate(preview.columns, start=1):
            col_letter = get_column_letter(c_idx)
            ws_detail.column_dimensions[col_letter].width = max(len(col.label) + 4, 16)

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer.getvalue()

    @classmethod
    async def export_pdf_report(
        cls,
        db: AsyncSession,
        req: ReportFilterRequest,
        current_user: Optional[User] = None,
    ) -> bytes:
        """Generate institutional government PDF report binary using ReportLab."""
        preview = await cls.get_report_preview(db, req, current_user)
        return cls.generate_pdf_report(preview)

    @classmethod
    async def export_excel_report(
        cls,
        db: AsyncSession,
        req: ReportFilterRequest,
        current_user: Optional[User] = None,
    ) -> bytes:
        """Generate multi-sheet government Excel workbook using OpenPyXL."""
        preview = await cls.get_report_preview(db, req, current_user)
        return cls.generate_excel_report(preview)
