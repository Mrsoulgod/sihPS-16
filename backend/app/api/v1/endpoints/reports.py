import io
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_optional_user
from app.models.user import User
from app.schemas.reports import (
    ReportFilterRequest,
    ReportExportRequest,
)
from app.services.report_service import ReportService

router = APIRouter()


@router.get("/types", summary="List available statutory MIS report types")
async def list_report_types():
    """Retrieve catalog of all statutory MIS reports, filter options, and export formats."""
    types = ReportService.get_report_types()
    return {
        "success": True,
        "data": [t.model_dump() for t in types],
        "message": "Report types catalog retrieved successfully.",
    }


@router.post("/preview", summary="Generate interactive report preview with summary KPIs")
async def get_report_preview(
    payload: ReportFilterRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Generate dynamic tabular preview, summary KPIs, and metadata for a chosen MIS report."""
    res = await ReportService.get_report_preview(
        db=db,
        req=payload,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": res.model_dump(),
        "message": "Report preview generated successfully.",
    }


@router.post("/export/pdf", summary="Export statutory report as official PDF document")
async def export_pdf_report(
    payload: ReportFilterRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Generate and download government-styled statutory MIS PDF document."""
    pdf_bytes = await ReportService.export_pdf_report(
        db=db,
        req=payload,
        current_user=current_user,
    )
    filename = f"NLAMS_{payload.report_type}_{int(io.time.time() if hasattr(io, 'time') else 20260904)}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
        },
    )


@router.post("/export/excel", summary="Export statutory report as multi-sheet Excel workbook")
async def export_excel_report(
    payload: ReportFilterRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Generate and download multi-sheet statutory MIS Excel (.xlsx) workbook."""
    xlsx_bytes = await ReportService.export_excel_report(
        db=db,
        req=payload,
        current_user=current_user,
    )
    filename = f"NLAMS_{payload.report_type}_{int(io.time.time() if hasattr(io, 'time') else 20260904)}.xlsx"

    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
        },
    )
