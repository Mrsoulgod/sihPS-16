import uuid
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.enums import RoleCode
from app.models.project import Project, ProjectStage
from app.models.location import District, State
from app.models.user import User
from app.schemas.project import ProjectListItem, ProjectDetailResponse
from app.services.workflow_engine import STAGE_SPECS_BY_CODE


class ProjectService:
    @staticmethod
    async def list_projects(
        db: AsyncSession,
        current_user: User,
        state_id: Optional[str] = None,
        stage: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[ProjectListItem]:
        """List infrastructure projects with jurisdiction scoping and search."""
        stmt = (
            select(Project)
            .options(
                selectinload(Project.primary_district).selectinload(District.state),
                selectinload(Project.parcels),
            )
        )

        user_role = current_user.role_id

        # 1. Jurisdiction Scoping
        if user_role in (RoleCode.DISTRICT_OFFICER.value, RoleCode.FIELD_OFFICER.value) and current_user.district_id:
            stmt = stmt.where(Project.primary_district_id == current_user.district_id)
        elif user_role == RoleCode.STATE_OFFICER.value and current_user.state_id:
            stmt = stmt.join(District, Project.primary_district_id == District.id).where(
                District.state_id == current_user.state_id
            )
        elif user_role == RoleCode.PROJECT_AGENCY.value and current_user.organization:
            stmt = stmt.where(Project.implementing_agency.ilike(f"%{current_user.organization}%"))

        # 2. Query Filters
        if state_id:
            if user_role != RoleCode.STATE_OFFICER.value:
                stmt = stmt.join(District, Project.primary_district_id == District.id).where(
                    District.state_id == state_id
                )
        if stage:
            stmt = stmt.where(Project.current_stage == stage)
        if search and search.strip():
            term = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Project.project_code.ilike(term),
                    Project.title.ilike(term),
                    Project.implementing_agency.ilike(term),
                )
            )

        result = await db.execute(stmt.order_by(Project.project_code.asc()))
        projects = result.scalars().all()

        items: List[ProjectListItem] = []
        for p in projects:
            prop_acres = float(p.total_land_proposed_acres)
            acq_acres = float(p.total_land_acquired_acres)
            acq_pct = round((acq_acres / prop_acres * 100.0), 1) if prop_acres > 0 else 0.0

            assessed_cr = float(p.compensation_assessed_cr)
            disbursed_cr = float(p.compensation_disbursed_cr)
            disb_pct = round((disbursed_cr / assessed_cr * 100.0), 1) if assessed_cr > 0 else 0.0

            spec = STAGE_SPECS_BY_CODE.get(p.current_stage)
            stage_name = spec["stage_name"] if spec else p.current_stage.replace("_", " ").title()

            dist_name = p.primary_district.name if p.primary_district else None
            st_name = p.primary_district.state.name if (p.primary_district and p.primary_district.state) else None

            items.append(
                ProjectListItem(
                    id=p.id,
                    project_code=p.project_code,
                    title=p.title,
                    description=p.description,
                    sponsoring_ministry=p.sponsoring_ministry,
                    implementing_agency=p.implementing_agency,
                    current_stage=p.current_stage,
                    current_stage_name=stage_name,
                    primary_district_name=dist_name,
                    state_name=st_name,
                    total_land_proposed_acres=round(prop_acres, 2),
                    total_land_acquired_acres=round(acq_acres, 2),
                    acquisition_progress_percent=acq_pct,
                    total_possession_acres=round(float(p.total_possession_acres), 2),
                    estimated_budget_inr_cr=round(float(p.estimated_budget_inr_cr), 2),
                    compensation_assessed_cr=round(assessed_cr, 2),
                    compensation_disbursed_cr=round(disbursed_cr, 2),
                    disbursement_percent=disb_pct,
                    total_paf_count=p.total_paf_count,
                    total_pdf_count=p.total_pdf_count,
                    randr_completion_percent=round(float(p.randr_completion_percent), 1),
                    risk_score=p.risk_score,
                    parcels_count=len(p.parcels),
                )
            )

        return items

    @staticmethod
    async def get_project_detail(
        db: AsyncSession,
        project_id: uuid.UUID,
        current_user: User,
    ) -> ProjectDetailResponse:
        """Fetch 360° detail for an infrastructure project."""
        stmt = (
            select(Project)
            .where(Project.id == project_id)
            .options(
                selectinload(Project.primary_district).selectinload(District.state),
                selectinload(Project.parcels),
            )
        )
        result = await db.execute(stmt)
        project = result.scalar_one_or_none()

        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        prop_acres = float(project.total_land_proposed_acres)
        acq_acres = float(project.total_land_acquired_acres)
        poss_acres = float(project.total_possession_acres)
        acq_pct = round((acq_acres / prop_acres * 100.0), 1) if prop_acres > 0 else 0.0
        poss_pct = round((poss_acres / prop_acres * 100.0), 1) if prop_acres > 0 else 0.0

        assessed_cr = float(project.compensation_assessed_cr)
        disbursed_cr = float(project.compensation_disbursed_cr)
        disb_pct = round((disbursed_cr / assessed_cr * 100.0), 1) if assessed_cr > 0 else 0.0

        spec = STAGE_SPECS_BY_CODE.get(project.current_stage)
        stage_name = spec["stage_name"] if spec else project.current_stage.replace("_", " ").title()

        dist_name = project.primary_district.name if project.primary_district else None
        st_id = project.primary_district.state_id if project.primary_district else None
        st_name = project.primary_district.state.name if (project.primary_district and project.primary_district.state) else None

        return ProjectDetailResponse(
            id=project.id,
            project_code=project.project_code,
            title=project.title,
            description=project.description,
            sponsoring_ministry=project.sponsoring_ministry,
            implementing_agency=project.implementing_agency,
            current_stage=project.current_stage,
            current_stage_name=stage_name,
            primary_district_id=project.primary_district_id,
            primary_district_name=dist_name,
            state_id=st_id,
            state_name=st_name,
            total_land_proposed_acres=round(prop_acres, 2),
            total_land_acquired_acres=round(acq_acres, 2),
            total_possession_acres=round(poss_acres, 2),
            acquisition_progress_percent=acq_pct,
            possession_percent=poss_pct,
            estimated_budget_inr_cr=round(float(project.estimated_budget_inr_cr), 2),
            compensation_assessed_cr=round(assessed_cr, 2),
            compensation_disbursed_cr=round(disbursed_cr, 2),
            disbursement_percent=disb_pct,
            total_paf_count=project.total_paf_count,
            total_pdf_count=project.total_pdf_count,
            randr_completion_percent=round(float(project.randr_completion_percent), 1),
            risk_score=project.risk_score,
            parcels_count=len(project.parcels),
            created_at=None,
            alignment_geojson=project.alignment_geojson,
        )
