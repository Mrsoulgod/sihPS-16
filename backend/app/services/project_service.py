import uuid
from decimal import Decimal
from datetime import datetime, date, timedelta, timezone
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.enums import RoleCode, ProjectStageCode, StageStatus, TransitionDecision, ProjectProposalStatus
from app.models.project import Project, ProjectStage, StageTransitionHistory, WorkflowTask
from app.models.parcel import LandParcel
from app.models.compensation import CompensationAssessment
from app.models.award import Award
from app.models.disbursement import Disbursement
from app.models.possession import Possession
from app.models.randr import RAndRScheme, AffectedFamily
from app.models.location import District, State
from app.models.user import User
from app.models.audit import AuditLog
from app.models.alert import Alert
from app.schemas.project import (
    ProjectListItem,
    ProjectDetailResponse,
    ProjectProposalCreate,
    ProjectDraftUpdate,
    ProjectSubmitRequest,
    ProjectResubmitRequest,
    SurveyRequestCreate,
)
from app.services.workflow_engine import STAGE_SPECS_BY_CODE, WORKFLOW_STAGE_SPECS


class ProjectService:
    @staticmethod
    def _compute_project_status(p: Project) -> Tuple[str, str]:
        """Compute human-readable status and next pending action for a project."""
        stage = str(p.current_stage).upper()
        
        # Check if rework is flagged
        has_rework = False
        if hasattr(p, "stages") and p.stages:
            for s in p.stages:
                if s.status == "REWORK_REQUIRED" or (s.rejection_reason and s.status != "COMPLETED"):
                    has_rework = True
                    break

        if has_rework:
            return ProjectProposalStatus.REWORK_REQUESTED.value, "Address CALA Scrutiny Rework & Resubmit"

        if stage == "PROJECT_PROPOSAL":
            # Check if stage is draft or submitted
            is_draft = True
            if hasattr(p, "stages") and p.stages:
                for s in p.stages:
                    if s.stage_code == "PROJECT_PROPOSAL" and s.status in ("COMPLETED", "SUBMITTED"):
                        is_draft = False
            if is_draft:
                return ProjectProposalStatus.DRAFT.value, "Complete Proposal Details & Submit"
            return ProjectProposalStatus.SUBMITTED.value, "Awaiting District / CALA Scrutiny"

        if stage == "INITIAL_SCRUTINY":
            return ProjectProposalStatus.UNDER_SCRUTINY.value, "District Scrutiny & Field Mandate"

        if stage in ("LAND_IDENTIFICATION", "LAND_VERIFICATION"):
            return ProjectProposalStatus.ACQUISITION_IN_PROGRESS.value, "Cadastral Verification & Ground Truthing"

        if stage in ("NOTIFICATION", "OBJECTION_HEARING"):
            return ProjectProposalStatus.ACQUISITION_IN_PROGRESS.value, "Sec 11/15 Statutory Gazette & Objections"

        if stage in ("COMPENSATION_ASSESSMENT", "AWARD", "COMPENSATION_DISBURSEMENT"):
            return ProjectProposalStatus.ACQUISITION_IN_PROGRESS.value, "Compensation Determination & PFMS DBT"

        if stage in ("POSSESSION", "R_AND_R"):
            return ProjectProposalStatus.ACQUISITION_IN_PROGRESS.value, "Section 38 Handover & R&R Execution"

        if stage == "COMPLETION":
            return ProjectProposalStatus.COMPLETED.value, "Corridor Dedicated & Archived"

        return ProjectProposalStatus.APPROVED.value, "Proceed to Next Milestone"

    @staticmethod
    async def list_projects(
        db: AsyncSession,
        current_user: Optional[User] = None,
        state_id: Optional[str] = None,
        stage: Optional[str] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[ProjectListItem]:
        """List infrastructure projects with strict jurisdiction and agency scoping."""
        stmt = (
            select(Project)
            .options(
                selectinload(Project.primary_district).selectinload(District.state),
                selectinload(Project.parcels),
                selectinload(Project.stages),
            )
        )

        user_role = current_user.role_id if current_user else None

        # 1. Jurisdiction & Agency Scoping (enforced from authenticated user identity)
        if current_user and user_role:
            if user_role in (RoleCode.DISTRICT_OFFICER.value, RoleCode.FIELD_OFFICER.value) and current_user.district_id:
                stmt = stmt.where(Project.primary_district_id == current_user.district_id)
            elif user_role == RoleCode.STATE_OFFICER.value and current_user.state_id:
                stmt = stmt.join(District, Project.primary_district_id == District.id).where(
                    District.state_id == current_user.state_id
                )
            elif user_role == RoleCode.PROJECT_AGENCY.value:
                # Project Agency can ONLY access projects belonging to its authenticated agency/project scope
                if current_user.organization:
                    stmt = stmt.where(
                        or_(
                            Project.implementing_agency.ilike(f"%{current_user.organization}%"),
                            Project.created_by_user_id == current_user.id,
                        )
                    )
                else:
                    stmt = stmt.where(Project.created_by_user_id == current_user.id)

        # 2. Query Filters
        if state_id:
            if not user_role or user_role != RoleCode.STATE_OFFICER.value:
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

        result = await db.execute(stmt.order_by(Project.created_at.desc(), Project.project_code.asc()))
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

            p_status, p_action = ProjectService._compute_project_status(p)

            if status_filter and status_filter.upper() != "ALL" and p_status != status_filter.upper():
                continue

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
                    status=p_status,
                    proposal_status=p_status,
                    primary_district_id=p.primary_district_id,
                    primary_district_name=dist_name,
                    state_id=p.primary_district.state_id if p.primary_district else None,
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
                    parcels_count=len(p.parcels) if hasattr(p, "parcels") and p.parcels else 0,
                    pending_action=p_action,
                )
            )

        return items

    @staticmethod
    async def get_project_detail(
        db: AsyncSession,
        project_id: uuid.UUID,
        current_user: Optional[User] = None,
    ) -> ProjectDetailResponse:
        """Fetch 360° detail for an infrastructure project with strict scope verification."""
        stmt = (
            select(Project)
            .options(
                selectinload(Project.primary_district).selectinload(District.state),
                selectinload(Project.parcels),
                selectinload(Project.stages),
                selectinload(Project.created_by),
            )
            .where(Project.id == project_id)
        )
        project = (await db.execute(stmt)).scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        # Strict Agency Scope Verification
        if current_user and current_user.role_id == RoleCode.PROJECT_AGENCY.value:
            if project.created_by_user_id != current_user.id and (current_user.organization or "").lower() not in project.implementing_agency.lower():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied. Project Agency can only access projects within its authenticated agency scope."
                )

        prop_acres = float(project.total_land_proposed_acres)
        acq_acres = float(project.total_land_acquired_acres)
        poss_acres = float(project.total_possession_acres)
        budget_cr = float(project.estimated_budget_inr_cr)
        assessed_cr = float(project.compensation_assessed_cr)
        disbursed_cr = float(project.compensation_disbursed_cr)

        acq_pct = round((acq_acres / prop_acres * 100.0), 1) if prop_acres > 0 else 0.0
        poss_pct = round((poss_acres / prop_acres * 100.0), 1) if prop_acres > 0 else 0.0
        disb_pct = round((disbursed_cr / assessed_cr * 100.0), 1) if assessed_cr > 0 else 0.0

        spec = STAGE_SPECS_BY_CODE.get(project.current_stage)
        stage_name = spec["stage_name"] if spec else project.current_stage.replace("_", " ").title()

        dist_name = project.primary_district.name if project.primary_district else None
        st_id = project.primary_district.state_id if project.primary_district else None
        st_name = project.primary_district.state.name if (project.primary_district and project.primary_district.state) else None

        # Query Live Acquisition Lifecycle Metrics
        verified_count = sum(1 for p in project.parcels if p.acquisition_status != "PROPOSED")

        # Compensation Assessments count & total
        ca_stmt = (
            select(
                func.count(CompensationAssessment.id),
                func.coalesce(func.sum(CompensationAssessment.total_compensation_inr), 0)
            )
            .join(LandParcel, CompensationAssessment.parcel_id == LandParcel.id)
            .where(LandParcel.project_id == project.id)
        )
        ca_res = await db.execute(ca_stmt)
        ca_row = ca_res.first()
        assessed_count = ca_row[0] if ca_row else 0
        live_assessed_cr = float(ca_row[1]) / 1e7 if ca_row and ca_row[1] > 0 else assessed_cr

        # Awards count & total
        aw_stmt = (
            select(
                func.count(Award.id),
                func.coalesce(func.sum(Award.total_award_amount_inr), 0)
            )
            .where(Award.project_id == project.id)
        )
        aw_res = await db.execute(aw_stmt)
        aw_row = aw_res.first()
        awards_count = aw_row[0] if aw_row else 0
        total_awarded_cr = round(float(aw_row[1]) / 1e7, 2) if aw_row and aw_row[1] > 0 else round(assessed_cr, 2)

        # Disbursements total & parcels
        disb_stmt = (
            select(
                func.coalesce(func.sum(Disbursement.amount_inr), 0),
                func.count(func.distinct(Disbursement.parcel_id))
            )
            .join(Award, Disbursement.award_id == Award.id)
            .where(
                Award.project_id == project.id,
                Disbursement.payment_status.in_(["DISBURSED", "SUCCESS_CREDITED"])
            )
        )
        disb_res = await db.execute(disb_stmt)
        disb_row = disb_res.first()
        live_disbursed_cr = round(float(disb_row[0]) / 1e7, 2) if disb_row and disb_row[0] > 0 else round(disbursed_cr, 2)
        disbursed_parcels_count = disb_row[1] if disb_row else sum(1 for p in project.parcels if p.acquisition_status in ("DISBURSED", "POSSESSION_TAKEN"))

        # Possessions count
        poss_stmt = select(func.count(Possession.id)).where(
            Possession.project_id == project.id,
            Possession.status == "TAKEN"
        )
        poss_count = (await db.execute(poss_stmt)).scalar_one_or_none() or sum(1 for p in project.parcels if p.acquisition_status == "POSSESSION_TAKEN")
        pending_poss_count = max(0, len(project.parcels) - poss_count)

        # R&R Counts
        rr_schemes_stmt = select(func.count(RAndRScheme.id)).where(RAndRScheme.project_id == project.id)
        randr_schemes_count = (await db.execute(rr_schemes_stmt)).scalar_one_or_none() or 0

        rr_fams_stmt = (
            select(AffectedFamily)
            .join(RAndRScheme, AffectedFamily.scheme_id == RAndRScheme.id)
            .where(RAndRScheme.project_id == project.id)
        )
        rr_fams = (await db.execute(rr_fams_stmt)).scalars().all()
        live_paf_count = len(rr_fams) if rr_fams else project.total_paf_count
        eligible_fams_count = sum(1 for f in rr_fams if f.eligibility_status in ("ELIGIBLE", "APPROVED")) if rr_fams else int(project.total_paf_count * 0.85)
        assisted_fams_count = sum(1 for f in rr_fams if f.rehabilitation_status in ("PLOT_ALLOTTED", "SETTLED") or f.allotted_plot_number) if rr_fams else int(project.total_paf_count * 0.65)
        pending_fams_count = max(0, live_paf_count - eligible_fams_count)

        final_assessed_cr = round(live_assessed_cr if live_assessed_cr > 0 else assessed_cr, 2)
        final_disbursed_cr = round(live_disbursed_cr if live_disbursed_cr > 0 else disbursed_cr, 2)
        outstanding_cr = round(max(0.0, total_awarded_cr - final_disbursed_cr), 2)
        final_disb_pct = round((final_disbursed_cr / final_assessed_cr * 100.0), 1) if final_assessed_cr > 0 else 0.0

        p_status, _ = ProjectService._compute_project_status(project)

        return ProjectDetailResponse(
            id=project.id,
            project_code=project.project_code,
            title=project.title,
            description=project.description,
            sponsoring_ministry=project.sponsoring_ministry,
            implementing_agency=project.implementing_agency,
            current_stage=project.current_stage,
            current_stage_name=stage_name,
            status=p_status,
            proposal_status=p_status,
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
            compensation_assessed_cr=final_assessed_cr,
            compensation_disbursed_cr=final_disbursed_cr,
            disbursement_percent=final_disb_pct,
            total_paf_count=live_paf_count,
            total_pdf_count=project.total_pdf_count,
            randr_completion_percent=round(float(project.randr_completion_percent), 1),
            risk_score=project.risk_score,
            parcels_count=len(project.parcels),
            verified_parcels_count=verified_count,
            assessed_parcels_count=assessed_count,
            awards_count=awards_count,
            disbursed_parcels_count=disbursed_parcels_count,
            possession_parcels_count=poss_count,
            parcels_pending_possession_count=pending_poss_count,
            total_awarded_cr=total_awarded_cr,
            outstanding_compensation_cr=outstanding_cr,
            randr_schemes_count=randr_schemes_count,
            eligible_families_count=eligible_fams_count,
            assisted_families_count=assisted_fams_count,
            pending_families_count=pending_fams_count,
            created_at=project.created_at,
            alignment_geojson=project.alignment_geojson,
        )

    @staticmethod
    async def create_project_proposal(
        db: AsyncSession,
        req: ProjectProposalCreate,
        current_user: User,
    ) -> ProjectDetailResponse:
        """
        Create a new multi-step infrastructure project proposal in the database.
        Automatically binds authenticated user, agency, created_by, and sets initial workflow stage.
        """
        # Role verification
        allowed_roles = (
            RoleCode.PROJECT_AGENCY.value,
            RoleCode.ADMIN.value,
            RoleCode.SUPER_ADMIN.value,
            RoleCode.CENTRAL_OFFICER.value,
        )
        if current_user.role_id not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role_id}' is not authorized to originate new project proposals."
            )

        # Check unique project code
        code_check = await db.execute(select(Project).where(Project.project_code == req.project_code))
        if code_check.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Project code '{req.project_code}' already exists. Please choose a unique corridor identifier."
            )

        agency_name = current_user.organization or "National Highways Authority of India (NHAI)"
        now = datetime.now(timezone.utc)
        today = date.today()

        initial_stage = "PROJECT_PROPOSAL"
        if not req.is_draft:
            initial_stage = "INITIAL_SCRUTINY"

        land_acres = req.total_land_proposed_acres if req.total_land_proposed_acres is not None else (req.total_land_required_acres if req.total_land_required_acres is not None else 100.0)
        budget_cr = req.estimated_budget_inr_cr if req.estimated_budget_inr_cr is not None else (req.estimated_project_cost_cr if req.estimated_project_cost_cr is not None else 500.0)

        # Ensure user exists in database session to satisfy foreign key constraint
        user_check = await db.execute(select(User).where(or_(User.id == current_user.id, User.username == current_user.username)))
        db_user = user_check.scalar_one_or_none()
        if db_user:
            user_id_to_use = db_user.id
        else:
            new_u = User(
                id=current_user.id,
                username=current_user.username,
                email=current_user.email,
                hashed_password=getattr(current_user, "hashed_password", None) or "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
                full_name=current_user.full_name,
                designation=current_user.designation,
                organization=current_user.organization,
                role_id=current_user.role_id,
                state_id=current_user.state_id,
                district_id=current_user.district_id,
                is_active=True,
            )
            db.add(new_u)
            await db.flush()
            user_id_to_use = new_u.id

        new_project = Project(
            id=uuid.uuid4(),
            project_code=req.project_code,
            title=req.title,
            description=req.description or "Infrastructure Project Proposal",
            sponsoring_ministry=req.sponsoring_ministry or "Ministry of Road Transport and Highways",
            implementing_agency=agency_name,
            current_stage=initial_stage,
            primary_district_id=req.primary_district_id or "DST-JAI",
            total_land_proposed_acres=Decimal(str(land_acres)),
            total_land_acquired_acres=Decimal("0.0"),
            total_possession_acres=Decimal("0.0"),
            estimated_budget_inr_cr=Decimal(str(budget_cr)),
            compensation_assessed_cr=Decimal("0.0"),
            compensation_disbursed_cr=Decimal("0.0"),
            total_paf_count=req.expected_parcel_count or 0,
            total_pdf_count=0,
            randr_completion_percent=Decimal("0.0"),
            alignment_geojson=req.alignment_geojson,
            risk_score=20,
            created_by_user_id=user_id_to_use,
        )
        db.add(new_project)
        await db.flush()

        # Initialize Project Stages
        for spec in WORKFLOW_STAGE_SPECS:
            code = spec["stage_code"]
            if req.is_draft:
                st_status = "IN_PROGRESS" if code == "PROJECT_PROPOSAL" else "PENDING"
                st_started = now if code == "PROJECT_PROPOSAL" else None
                st_due = (today + timedelta(days=spec["sla_days"])) if code == "PROJECT_PROPOSAL" else None
            else:
                if code == "PROJECT_PROPOSAL":
                    st_status = "COMPLETED"
                    st_started = now
                    st_due = None
                elif code == "INITIAL_SCRUTINY":
                    st_status = "IN_PROGRESS"
                    st_started = now
                    st_due = today + timedelta(days=spec["sla_days"])
                else:
                    st_status = "PENDING"
                    st_started = None
                    st_due = None

            db.add(
                ProjectStage(
                    project_id=new_project.id,
                    stage_code=code,
                    status=st_status,
                    started_at=st_started,
                    due_date=st_due,
                    completed_at=now if (not req.is_draft and code == "PROJECT_PROPOSAL") else None,
                    sla_deadline_days=spec["sla_days"],
                    assigned_role=spec["primary_role"],
                    comments=req.submission_remarks if code == "PROJECT_PROPOSAL" else None,
                )
            )

        # Record History & Audit
        action_name = "PROJECT_DRAFT_CREATED" if req.is_draft else "PROJECT_PROPOSAL_SUBMITTED"
        history = StageTransitionHistory(
            project_id=new_project.id,
            from_stage="ORIGIN",
            to_stage=initial_stage,
            triggered_by_user_id=user_id_to_use,
            decision="APPROVED" if not req.is_draft else "DRAFT",
            remarks=req.submission_remarks or ("Initial project proposal drafted by agency" if req.is_draft else "Project proposal submitted for CALA scrutiny"),
            snapshot_metrics_json={
                "land_proposed_acres": float(land_acres),
                "budget_cr": float(budget_cr),
                "agency": agency_name,
            },
            created_at=now,
        )
        db.add(history)

        audit = AuditLog(
            user_id=user_id_to_use,
            action=action_name,
            entity_name="Project",
            entity_id=str(new_project.id),
            new_values={
                "project_code": new_project.project_code,
                "title": new_project.title,
                "implementing_agency": new_project.implementing_agency,
                "is_draft": req.is_draft,
                "current_stage": initial_stage,
            },
            timestamp=now,
        )
        db.add(audit)

        # If submitted, create scrutiny task for District CALA Officer
        if not req.is_draft:
            task = WorkflowTask(
                project_id=new_project.id,
                task_type="PROPOSAL_SCRUTINY",
                title=f"Conduct Administrative Scrutiny: {new_project.project_code}",
                description=f"Initial inter-departmental scrutiny and public purpose verification for {new_project.title}.",
                assigned_role=RoleCode.DISTRICT_OFFICER.value,
                status="PENDING",
                priority="HIGH",
                due_date=today + timedelta(days=21),
                action_url=f"/projects/{new_project.id}",
                created_at=now,
            )
            db.add(task)

            alert = Alert(
                project_id=new_project.id,
                severity="INFO",
                category="PROPOSAL_SUBMITTED",
                title=f"New Proposal Submitted: {new_project.project_code}",
                message=f"Proposal submitted by {current_user.full_name} ({agency_name}). Ready for CALA administrative scrutiny.",
                target_role=RoleCode.DISTRICT_OFFICER.value,
                is_resolved=False,
                created_at=now,
            )
            db.add(alert)

        await db.commit()
        return await ProjectService.get_project_detail(db, new_project.id, current_user)

    @staticmethod
    async def update_project_draft(
        db: AsyncSession,
        project_id: uuid.UUID,
        req: ProjectDraftUpdate,
        current_user: User,
    ) -> ProjectDetailResponse:
        """Update a project proposal in DRAFT or REWORK_REQUESTED status."""
        stmt = select(Project).where(Project.id == project_id)
        project = (await db.execute(stmt)).scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        # Verify agency ownership
        if current_user.role_id == RoleCode.PROJECT_AGENCY.value:
            if project.created_by_user_id != current_user.id and (current_user.organization or "").lower() not in project.implementing_agency.lower():
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only edit proposals belonging to your agency.")

        # Check editable stage
        if project.current_stage not in ("PROJECT_PROPOSAL", "INITIAL_SCRUTINY"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Project in stage '{project.current_stage}' cannot be edited freely as a draft."
            )

        if req.title:
            project.title = req.title
        if req.description:
            project.description = req.description
        if req.sponsoring_ministry:
            project.sponsoring_ministry = req.sponsoring_ministry
        if req.estimated_budget_inr_cr is not None:
            project.estimated_budget_inr_cr = Decimal(str(req.estimated_budget_inr_cr))
        elif req.estimated_project_cost_cr is not None:
            project.estimated_budget_inr_cr = Decimal(str(req.estimated_project_cost_cr))

        if req.total_land_proposed_acres is not None:
            project.total_land_proposed_acres = Decimal(str(req.total_land_proposed_acres))
        elif req.total_land_required_acres is not None:
            project.total_land_proposed_acres = Decimal(str(req.total_land_required_acres))
        if req.primary_district_id:
            project.primary_district_id = req.primary_district_id
        if req.alignment_geojson is not None:
            project.alignment_geojson = req.alignment_geojson

        audit = AuditLog(
            user_id=current_user.id,
            action="PROJECT_DRAFT_UPDATED",
            entity_name="Project",
            entity_id=str(project.id),
            new_values={"remarks": req.submission_remarks or "Draft details updated"},
            timestamp=datetime.now(timezone.utc),
        )
        db.add(audit)
        await db.commit()

        return await ProjectService.get_project_detail(db, project.id, current_user)

    @staticmethod
    async def submit_project_proposal(
        db: AsyncSession,
        project_id: uuid.UUID,
        req: ProjectSubmitRequest,
        current_user: User,
    ) -> ProjectDetailResponse:
        """Formally submit a DRAFT project proposal for District / CALA scrutiny."""
        stmt = (
            select(Project)
            .where(Project.id == project_id)
            .options(selectinload(Project.stages))
        )
        project = (await db.execute(stmt)).scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        # Verify agency ownership
        if current_user.role_id == RoleCode.PROJECT_AGENCY.value:
            if project.created_by_user_id != current_user.id and (current_user.organization or "").lower() not in project.implementing_agency.lower():
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only submit proposals belonging to your agency.")

        now = datetime.now(timezone.utc)
        today = date.today()

        # Update Project Stage to INITIAL_SCRUTINY
        old_stage = project.current_stage
        project.current_stage = "INITIAL_SCRUTINY"

        for s in project.stages:
            if s.stage_code == "PROJECT_PROPOSAL":
                s.status = "COMPLETED"
                s.completed_at = now
                s.comments = req.submission_remarks
            elif s.stage_code == "INITIAL_SCRUTINY":
                s.status = "IN_PROGRESS"
                s.started_at = now
                s.due_date = today + timedelta(days=21)

        history = StageTransitionHistory(
            project_id=project.id,
            from_stage=old_stage,
            to_stage="INITIAL_SCRUTINY",
            triggered_by_user_id=current_user.id,
            decision="APPROVED",
            remarks=req.submission_remarks or "Formal proposal submitted for CALA administrative scrutiny",
            created_at=now,
        )
        db.add(history)

        task = WorkflowTask(
            project_id=project.id,
            task_type="PROPOSAL_SCRUTINY",
            title=f"Conduct Administrative Scrutiny: {project.project_code}",
            description=f"Scrutiny for {project.title} submitted by {current_user.full_name}.",
            assigned_role=RoleCode.DISTRICT_OFFICER.value,
            status="PENDING",
            priority="HIGH",
            due_date=today + timedelta(days=21),
            action_url=f"/projects/{project.id}",
            created_at=now,
        )
        db.add(task)

        audit = AuditLog(
            user_id=current_user.id,
            action="PROJECT_PROPOSAL_SUBMITTED",
            entity_name="Project",
            entity_id=str(project.id),
            new_values={"submitted_stage": "INITIAL_SCRUTINY", "remarks": req.submission_remarks},
            timestamp=now,
        )
        db.add(audit)
        await db.commit()

        return await ProjectService.get_project_detail(db, project.id, current_user)

    @staticmethod
    async def resubmit_project_proposal(
        db: AsyncSession,
        project_id: uuid.UUID,
        req: ProjectResubmitRequest,
        current_user: User,
    ) -> ProjectDetailResponse:
        """Resubmit project proposal following a District / CALA Scrutiny Rework request."""
        stmt = (
            select(Project)
            .where(Project.id == project_id)
            .options(selectinload(Project.stages))
        )
        project = (await db.execute(stmt)).scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        now = datetime.now(timezone.utc)
        today = date.today()
        remarks_text = req.rework_response_remarks or req.response_remarks or req.corrections_summary or "Proposal resubmitted with corrections"

        project.current_stage = "INITIAL_SCRUTINY"

        for s in project.stages:
            if s.stage_code == "INITIAL_SCRUTINY":
                s.status = "IN_PROGRESS"
                s.started_at = now
                s.due_date = today + timedelta(days=14)
                s.rejection_reason = None
                s.comments = f"Resubmitted with corrections: {remarks_text}"

        history = StageTransitionHistory(
            project_id=project.id,
            from_stage="REWORK_REQUESTED",
            to_stage="INITIAL_SCRUTINY",
            triggered_by_user_id=current_user.id,
            decision="RESUBMITTED",
            remarks=remarks_text,
            created_at=now,
        )
        db.add(history)

        task = WorkflowTask(
            project_id=project.id,
            task_type="REWORK_SCRUTINY",
            title=f"Review Resubmitted Proposal: {project.project_code}",
            description=f"Rework completed by Agency: {remarks_text}",
            assigned_role=RoleCode.DISTRICT_OFFICER.value,
            status="PENDING",
            priority="HIGH",
            due_date=today + timedelta(days=14),
            action_url=f"/projects/{project.id}",
            created_at=now,
        )
        db.add(task)

        audit = AuditLog(
            user_id=current_user.id,
            action="PROJECT_PROPOSAL_RESUBMITTED",
            entity_name="Project",
            entity_id=str(project.id),
            new_values={"remarks": remarks_text, "corrected_fields": req.corrected_fields},
            timestamp=now,
        )
        db.add(audit)
        await db.commit()

        return await ProjectService.get_project_detail(db, project.id, current_user)

    @staticmethod
    async def create_survey_request(
        db: AsyncSession,
        req: SurveyRequestCreate,
        current_user: User,
    ) -> Dict[str, Any]:
        """Project Agency submits a request for land survey / field verification to District / CALA."""
        stmt = select(Project).where(Project.id == req.project_id)
        project = (await db.execute(stmt)).scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        now = datetime.now(timezone.utc)
        today = date.today()
        due_date = req.due_date or (today + timedelta(days=15))
        desc_text = req.description or req.justification or "Agency survey request for corridor verification"
        req_type = req.survey_type or req.request_type or "FIELD_VERIFICATION"
        target_v = req.target_village or (", ".join(req.target_villages) if req.target_villages else "Corridor")

        task = WorkflowTask(
            project_id=project.id,
            task_type="SURVEY_REQUEST",
            title=f"Survey Request: {req.title}",
            description=f"Agency survey request by {current_user.full_name}: {desc_text}. Target: {target_v} {req.target_khasra or ''}",
            assigned_role=RoleCode.DISTRICT_OFFICER.value,
            status="PENDING",
            priority=req.priority,
            due_date=due_date,
            action_url=f"/projects/{project.id}",
            created_at=now,
        )
        db.add(task)

        audit = AuditLog(
            user_id=current_user.id,
            action="SURVEY_REQUEST_INITIATED",
            entity_name="WorkflowTask",
            entity_id=str(task.id),
            new_values={
                "project_code": project.project_code,
                "request_type": req_type,
                "title": req.title,
                "target_village": target_v,
            },
            timestamp=now,
        )
        db.add(audit)
        await db.commit()

        return {
            "success": True,
            "task_id": str(task.id),
            "project_id": str(project.id),
            "project_code": project.project_code,
            "status": "REQUESTED_TO_DISTRICT_CALA",
            "message": "Survey request successfully routed to District CALA authority for Field Officer assignment.",
        }

