from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class ReportTypeInfo(BaseModel):
    id: str
    code: str
    title: str
    description: str
    category: str
    supported_filters: List[str]
    supported_formats: List[str] = ["PDF", "EXCEL", "JSON"]


class ReportFilterRequest(BaseModel):
    report_type: str = Field(..., description="Unique report code, e.g. 'NATIONAL_ACQUISITION_PROGRESS'")
    state_id: Optional[str] = None
    district_id: Optional[str] = None
    project_id: Optional[str] = None
    status: Optional[str] = None
    from_date: Optional[str] = None
    to_date: Optional[str] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(50, ge=1, le=500)


class ReportSummaryKpi(BaseModel):
    label: str
    value: str
    subtitle: Optional[str] = None


class ReportTableColumn(BaseModel):
    key: str
    label: str
    align: str = "left"  # left, right, center
    is_numeric: bool = False


class ReportPreviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    report_id: str
    report_title: str
    report_code: str
    scope_jurisdiction: str
    generated_at: str
    filter_summary: Dict[str, Any]
    summary_kpis: List[ReportSummaryKpi]
    columns: List[ReportTableColumn]
    rows: List[Dict[str, Any]]
    total_records: int
    page: int
    page_size: int
    total_pages: int


class ReportExportRequest(BaseModel):
    report_type: str
    export_format: str = "PDF"  # "PDF" or "EXCEL"
    state_id: Optional[str] = None
    district_id: Optional[str] = None
    project_id: Optional[str] = None
    status: Optional[str] = None
    from_date: Optional[str] = None
    to_date: Optional[str] = None
