import uuid
from datetime import datetime, date, timedelta, timezone
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.enums import RoleCode, ProjectStageCode, StageStatus, TransitionDecision, ComplianceStatus
from app.models.project import Project, ProjectStage, StageTransitionHistory, WorkflowTask
from app.models.location import District
from app.models.role import Role
from app.models.user import User
from app.models.audit import AuditLog
from app.models.alert import Alert
from app.schemas.workflow import (
    StageDefinition,
    ProjectStageItem,
    TransitionHistoryItem,
    ProjectWorkflowTimelineResponse,
    WorkflowTaskItem,
)

# 12 Statutory Acquisition Stages
WORKFLOW_STAGE_SPECS: List[Dict[str, Any]] = [
    {
        "stage_code": "PROJECT_PROPOSAL",
        "stage_name": "Project Proposal & DPR",
        "sequence_order": 1,
        "sla_days": 30,
        "statutory_reference": "Section 4 Preliminary DPR",
        "primary_role": RoleCode.PROJECT_AGENCY.value,
        "description": "Submission of Detailed Project Report, alignment corridor, and administrative sanction.",
        "can_reject": False,
        "rejection_target": None,
        "required_documents": ["Detailed Project Report (DPR)", "Feasibility Study", "Alignment KML Corridor"],
        "approver_roles": [RoleCode.PROJECT_AGENCY.value, RoleCode.ADMIN.value],
        "rejector_roles": [],
        "next_stage": "INITIAL_SCRUTINY",
    },
    {
        "stage_code": "INITIAL_SCRUTINY",
        "stage_name": "Initial Administrative Scrutiny",
        "sequence_order": 2,
        "sla_days": 21,
        "statutory_reference": "Section 4(1) Administrative Scrutiny",
        "primary_role": RoleCode.STATE_OFFICER.value,
        "description": "Inter-departmental vetting, public purpose validation, and social impact pre-assessment.",
        "can_reject": True,
        "rejection_target": "PROJECT_PROPOSAL",
        "required_documents": ["Administrative Sanction Order", "Departmental Clearance Certificate"],
        "approver_roles": [RoleCode.STATE_OFFICER.value, RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value],
        "rejector_roles": [RoleCode.STATE_OFFICER.value, RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value],
        "next_stage": "LAND_IDENTIFICATION",
    },
    {
        "stage_code": "LAND_IDENTIFICATION",
        "stage_name": "Land Identification & Cadastre",
        "sequence_order": 3,
        "sla_days": 30,
        "statutory_reference": "Section 4(2) Cadastral Demarcation",
        "primary_role": RoleCode.DISTRICT_OFFICER.value,
        "description": "Preparation of revenue Khasra maps, ownership title verification, and village land rosters.",
        "can_reject": True,
        "rejection_target": "INITIAL_SCRUTINY",
        "required_documents": ["Revenue Map Extracts (Jamabandi)", "Khasra Identification Roster"],
        "approver_roles": [RoleCode.DISTRICT_OFFICER.value, RoleCode.PROJECT_AGENCY.value, RoleCode.ADMIN.value],
        "rejector_roles": [RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value],
        "next_stage": "LAND_VERIFICATION",
    },
    {
        "stage_code": "LAND_VERIFICATION",
        "stage_name": "Field Verification & Valuation",
        "sequence_order": 4,
        "sla_days": 45,
        "statutory_reference": "Section 4(4) Ground Truthing & Asset Survey",
        "primary_role": RoleCode.FIELD_OFFICER.value,
        "description": "On-ground physical survey, enumeration of standing crops, trees, structures, and borewells.",
        "can_reject": True,
        "rejection_target": "LAND_IDENTIFICATION",
        "required_documents": ["Field Survey Panchnama", "Asset Enumeration Register", "Geo-tagged Photographs"],
        "approver_roles": [RoleCode.DISTRICT_OFFICER.value, RoleCode.FIELD_OFFICER.value, RoleCode.ADMIN.value],
        "rejector_roles": [RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value],
        "next_stage": "NOTIFICATION",
    },
    {
        "stage_code": "NOTIFICATION",
        "stage_name": "Section 11 Preliminary Notification",
        "sequence_order": 5,
        "sla_days": 30,
        "statutory_reference": "Section 11(1) RFCTLARR Gazette Publication",
        "primary_role": RoleCode.DISTRICT_OFFICER.value,
        "description": "Publication in official gazette, two daily newspapers, and gram panchayat notice boards.",
        "can_reject": False,
        "rejection_target": None,
        "required_documents": ["Official Gazette Notification Copy", "Newspaper Publication Clippings", "Gram Sabha Notice"],
        "approver_roles": [RoleCode.DISTRICT_OFFICER.value, RoleCode.STATE_OFFICER.value, RoleCode.ADMIN.value],
        "rejector_roles": [],
        "next_stage": "OBJECTION_HEARING",
    },
    {
        "stage_code": "OBJECTION_HEARING",
        "stage_name": "Section 15 Objection & Hearing",
        "sequence_order": 6,
        "sla_days": 60,
        "statutory_reference": "Section 15(1) & (2) Statutory Hearing by CALA",
        "primary_role": RoleCode.DISTRICT_OFFICER.value,
        "description": "Receipt of landowner objections within 60 days, personal hearings, and CALA reasoned orders.",
        "can_reject": True,
        "rejection_target": "NOTIFICATION",
        "required_documents": ["Objection Hearing Register", "CALA Statutory Reasoned Disposal Orders"],
        "approver_roles": [RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value],
        "rejector_roles": [RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value],
        "next_stage": "COMPENSATION_ASSESSMENT",
    },
    {
        "stage_code": "COMPENSATION_ASSESSMENT",
        "stage_name": "Compensation Assessment & Solatium",
        "sequence_order": 7,
        "sla_days": 30,
        "statutory_reference": "Sections 26 to 30 First Schedule Determination",
        "primary_role": RoleCode.DISTRICT_OFFICER.value,
        "description": "Market valuation calculation, rural multiplier (1.25x-1.50x), 100% Solatium, and 12% statutory interest.",
        "can_reject": False,
        "rejection_target": None,
        "required_documents": ["First Schedule Valuation Matrix", "DLC / Circle Rate Notification", "Asset Valuation Reports"],
        "approver_roles": [RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value],
        "rejector_roles": [],
        "next_stage": "AWARD",
    },
    {
        "stage_code": "AWARD",
        "stage_name": "Section 23/30 Statutory Award",
        "sequence_order": 8,
        "sla_days": 30,
        "statutory_reference": "Section 23 & 30 Declaration of Award",
        "primary_role": RoleCode.DISTRICT_OFFICER.value,
        "description": "Final declaration of statutory award by CALA, apportioning compensation among registered titleholders.",
        "can_reject": False,
        "rejection_target": None,
        "required_documents": ["Signed Form-V Award Document", "Landowner Compensation Apportionment Roster"],
        "approver_roles": [RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value],
        "rejector_roles": [],
        "next_stage": "COMPENSATION_DISBURSEMENT",
    },
    {
        "stage_code": "COMPENSATION_DISBURSEMENT",
        "stage_name": "Compensation Disbursement (PFMS/DBT)",
        "sequence_order": 9,
        "sla_days": 60,
        "statutory_reference": "Section 77 Direct Benefit Transfer",
        "primary_role": RoleCode.DISTRICT_OFFICER.value,
        "description": "Direct Benefit Transfer through PFMS integrated bank accounts directly to titleholders.",
        "can_reject": False,
        "rejection_target": None,
        "required_documents": ["PFMS Batch Processing Log", "Bank UTR Settlement Statements"],
        "approver_roles": [RoleCode.DISTRICT_OFFICER.value, RoleCode.PROJECT_AGENCY.value, RoleCode.ADMIN.value],
        "rejector_roles": [],
        "next_stage": "POSSESSION",
    },
    {
        "stage_code": "POSSESSION",
        "stage_name": "Section 38 Physical Possession",
        "sequence_order": 10,
        "sla_days": 30,
        "statutory_reference": "Section 38 Handover & Encumbrance-Free Vesting",
        "primary_role": RoleCode.DISTRICT_OFFICER.value,
        "description": "Execution of possession panchnama upon full compensation credit and physical handover to Agency.",
        "can_reject": False,
        "rejection_target": None,
        "required_documents": ["Possession Panchnama Certificate", "Encumbrance-Free Handover Memorandum"],
        "approver_roles": [RoleCode.DISTRICT_OFFICER.value, RoleCode.PROJECT_AGENCY.value, RoleCode.ADMIN.value],
        "rejector_roles": [],
        "next_stage": "R_AND_R",
    },
    {
        "stage_code": "R_AND_R",
        "stage_name": "Rehabilitation & Resettlement (R&R)",
        "sequence_order": 11,
        "sla_days": 90,
        "statutory_reference": "Second & Third Schedules Infrastructure Scheme",
        "primary_role": RoleCode.DISTRICT_OFFICER.value,
        "description": "Resettlement colony development, residential plot allotment, and subsistence grant distribution for PDFs.",
        "can_reject": False,
        "rejection_target": None,
        "required_documents": ["Approved R&R Scheme Notification", "Homestead Allotment Register", "Colony Completion Certificate"],
        "approver_roles": [RoleCode.DISTRICT_OFFICER.value, RoleCode.STATE_OFFICER.value, RoleCode.ADMIN.value],
        "rejector_roles": [],
        "next_stage": "COMPLETION",
    },
    {
        "stage_code": "COMPLETION",
        "stage_name": "Statutory Project Closure",
        "sequence_order": 12,
        "sla_days": 15,
        "statutory_reference": "Final Section 99 Audit & Cadastral Reconciliation",
        "primary_role": RoleCode.CENTRAL_OFFICER.value,
        "description": "Final cadastral boundary synchronization, audit sign-off, and project lifecycle archive.",
        "can_reject": False,
        "rejection_target": None,
        "required_documents": ["Final Project Completion Certificate", "Statutory Audit Reconciliation Report"],
        "approver_roles": [RoleCode.CENTRAL_OFFICER.value, RoleCode.ADMIN.value],
        "rejector_roles": [],
        "next_stage": None,
    },
]

STAGE_SPECS_BY_CODE = {s["stage_code"]: s for s in WORKFLOW_STAGE_SPECS}


class WorkflowEngine:
    @staticmethod
    def get_stage_definitions() -> List[StageDefinition]:
        """Return all 12 configurable statutory stages."""
        return [
            StageDefinition(
                stage_code=s["stage_code"],
                stage_name=s["stage_name"],
                sequence_order=s["sequence_order"],
                sla_days=s["sla_days"],
                statutory_reference=s["statutory_reference"],
                primary_role=s["primary_role"],
                description=s["description"],
                can_reject=s["can_reject"],
                rejection_target=s["rejection_target"],
                required_documents=s["required_documents"],
            )
            for s in WORKFLOW_STAGE_SPECS
        ]

    @staticmethod
    async def get_project_workflow_timeline(
        db: AsyncSession,
        project_id: uuid.UUID,
        current_user: User,
    ) -> ProjectWorkflowTimelineResponse:
        """Fetch complete 12-stage visual timeline, SLA compliance, and history."""
        # Query project with stages and history
        stmt = (
            select(Project)
            .where(Project.id == project_id)
            .options(
                selectinload(Project.stages),
                selectinload(Project.stage_history).selectinload(StageTransitionHistory.triggered_by).selectinload(User.role),
                selectinload(Project.primary_district),
            )
        )
        result = await db.execute(stmt)
        project = result.scalar_one_or_none()

        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        # Map existing project_stages by stage_code
        db_stages_map = {ps.stage_code: ps for ps in project.stages}

        current_stage_code = project.current_stage
        current_spec = STAGE_SPECS_BY_CODE.get(current_stage_code)
        current_seq = current_spec["sequence_order"] if current_spec else 1

        stage_items: List[ProjectStageItem] = []
        is_current_stage_overdue = False

        today = date.today()

        for spec in WORKFLOW_STAGE_SPECS:
            code = spec["stage_code"]
            db_stage = db_stages_map.get(code)

            # Determine status
            if db_stage:
                st_status = db_stage.status
                started_at = db_stage.started_at
                completed_at = db_stage.completed_at
                due_date = db_stage.due_date
                comments = db_stage.comments
                rejection_reason = db_stage.rejection_reason
                assigned_role = db_stage.assigned_role or spec["primary_role"]
                assigned_user_id = db_stage.assigned_user_id
            else:
                # Inferred status based on current sequence order
                if spec["sequence_order"] < current_seq:
                    st_status = StageStatus.COMPLETED.value
                    started_at = None
                    completed_at = None
                    due_date = None
                elif spec["sequence_order"] == current_seq:
                    st_status = StageStatus.IN_PROGRESS.value
                    started_at = datetime.now(timezone.utc) - timedelta(days=5)
                    due_date = today + timedelta(days=spec["sla_days"] - 5)
                    completed_at = None
                else:
                    st_status = StageStatus.PENDING.value
                    started_at = None
                    completed_at = None
                    due_date = None
                comments = None
                rejection_reason = None
                assigned_role = spec["primary_role"]
                assigned_user_id = None

            # Calculate deadline & compliance
            days_remaining = None
            is_overdue = False

            if st_status == StageStatus.COMPLETED.value:
                compliance_status = ComplianceStatus.COMPLETED.value
            elif st_status == StageStatus.IN_PROGRESS.value:
                if due_date:
                    diff_days = (due_date - today).days
                    days_remaining = diff_days
                    if diff_days < 0:
                        is_overdue = True
                        compliance_status = ComplianceStatus.OVERDUE.value
                    elif diff_days <= 7:
                        compliance_status = ComplianceStatus.DUE_SOON.value
                    else:
                        compliance_status = ComplianceStatus.ON_TRACK.value
                else:
                    compliance_status = ComplianceStatus.ON_TRACK.value
                if code == current_stage_code:
                    is_current_stage_overdue = is_overdue
            else:
                compliance_status = ComplianceStatus.ON_TRACK.value

            stage_items.append(
                ProjectStageItem(
                    id=db_stage.id if db_stage else uuid.uuid4(),
                    project_id=project.id,
                    stage_code=code,
                    stage_name=spec["stage_name"],
                    sequence_order=spec["sequence_order"],
                    status=st_status,
                    compliance_status=compliance_status,
                    sla_deadline_days=spec["sla_days"],
                    started_at=started_at,
                    due_date=due_date,
                    completed_at=completed_at,
                    days_remaining=days_remaining,
                    is_overdue=is_overdue,
                    assigned_role=assigned_role,
                    assigned_role_name=assigned_role,
                    assigned_user_id=assigned_user_id,
                    comments=comments,
                    rejection_reason=rejection_reason,
                    required_documents=spec["required_documents"],
                )
            )

        # Transition history
        history_items: List[TransitionHistoryItem] = []
        for h in sorted(project.stage_history, key=lambda x: x.created_at or datetime.min, reverse=True):
            user_name = h.triggered_by.full_name if h.triggered_by else "System Officer"
            role_name = h.triggered_by.role.name if h.triggered_by and h.triggered_by.role else "Authorized Authority"
            history_items.append(
                TransitionHistoryItem(
                    id=h.id,
                    from_stage=h.from_stage,
                    to_stage=h.to_stage,
                    decision=h.decision,
                    remarks=h.remarks,
                    triggered_by_user_id=h.triggered_by_user_id,
                    triggered_by_name=user_name,
                    triggered_by_role=role_name,
                    created_at=h.created_at,
                )
            )

        # Check if current user is authorized to transition this project
        user_role = current_user.role_id
        can_transition = False
        allowed_actions: List[Dict[str, Any]] = []

        if current_spec:
            # Check jurisdiction
            is_jurisdiction_valid = WorkflowEngine._check_jurisdiction(project, current_user)

            if is_jurisdiction_valid:
                # Check approve permission
                if user_role in current_spec["approver_roles"] and current_spec["next_stage"]:
                    can_transition = True
                    next_spec = STAGE_SPECS_BY_CODE.get(current_spec["next_stage"])
                    allowed_actions.append({
                        "action": TransitionDecision.APPROVED.value,
                        "label": f"Approve & Advance to {next_spec['stage_name'] if next_spec else current_spec['next_stage']}",
                        "target_stage": current_spec["next_stage"],
                    })

                # Check reject permission
                if user_role in current_spec["rejector_roles"] and current_spec["can_reject"]:
                    can_transition = True
                    target_spec = STAGE_SPECS_BY_CODE.get(current_spec["rejection_target"])
                    allowed_actions.append({
                        "action": TransitionDecision.REJECTED.value,
                        "label": f"Reject / Request Rework ({target_spec['stage_name'] if target_spec else current_spec['rejection_target']})",
                        "target_stage": current_spec["rejection_target"],
                    })

        # Calculate overall progress percent
        completed_stages = sum(1 for s in stage_items if s.status == StageStatus.COMPLETED.value)
        progress_pct = round((completed_stages / 12.0) * 100.0, 1)

        return ProjectWorkflowTimelineResponse(
            project_id=project.id,
            project_code=project.project_code,
            project_title=project.title,
            current_stage=project.current_stage,
            overall_progress_percent=progress_pct,
            is_current_stage_overdue=is_current_stage_overdue,
            stages=stage_items,
            transition_history=history_items,
            can_current_user_transition=can_transition,
            allowed_transitions=allowed_actions,
        )

    @staticmethod
    async def transition_stage(
        db: AsyncSession,
        project_id: uuid.UUID,
        current_user: User,
        decision: str,
        remarks: Optional[str] = None,
        rejection_reason: Optional[str] = None,
    ) -> ProjectWorkflowTimelineResponse:
        """Execute validated stage transition with RBAC, audit logging, and task triggers."""
        # 1. Fetch Project
        stmt = (
            select(Project)
            .where(Project.id == project_id)
            .options(
                selectinload(Project.stages),
                selectinload(Project.primary_district),
            )
        )
        result = await db.execute(stmt)
        project = result.scalar_one_or_none()

        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        # 2. Check Jurisdiction
        if not WorkflowEngine._check_jurisdiction(project, current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have jurisdiction over this project."
            )

        # 3. Check Current Stage Spec & Authorization
        current_code = project.current_stage
        current_spec = STAGE_SPECS_BY_CODE.get(current_code)

        if not current_spec:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid current stage: {current_code}")

        user_role = current_user.role_id

        if decision == TransitionDecision.APPROVED.value:
            if user_role not in current_spec["approver_roles"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Role {user_role} is not authorized to approve stage {current_code}."
                )
            if not current_spec["next_stage"]:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project is already at final stage.")
            target_stage_code = current_spec["next_stage"]

        elif decision == TransitionDecision.REJECTED.value:
            if not current_spec["can_reject"] or not current_spec["rejection_target"]:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Stage {current_code} does not permit rejection.")
            if user_role not in current_spec["rejector_roles"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Role {user_role} is not authorized to reject stage {current_code}."
                )
            if not rejection_reason or not rejection_reason.strip():
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Rejection reason is required.")
            target_stage_code = current_spec["rejection_target"]

        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsupported decision: {decision}")

        now = datetime.now(timezone.utc)
        today = date.today()

        # 4. Update ProjectStages in DB
        db_stages_map = {ps.stage_code: ps for ps in project.stages}

        # Current stage record
        current_db_stage = db_stages_map.get(current_code)
        if not current_db_stage:
            current_db_stage = ProjectStage(
                project_id=project.id,
                stage_code=current_code,
                sla_deadline_days=current_spec["sla_days"],
                assigned_role=current_spec["primary_role"],
            )
            db.add(current_db_stage)

        if decision == TransitionDecision.APPROVED.value:
            current_db_stage.status = StageStatus.COMPLETED.value
            current_db_stage.completed_at = now
            current_db_stage.comments = remarks
        else:
            current_db_stage.status = StageStatus.BLOCKED.value
            current_db_stage.rejection_reason = rejection_reason
            current_db_stage.comments = remarks

        # Target stage record
        target_spec = STAGE_SPECS_BY_CODE[target_stage_code]
        target_db_stage = db_stages_map.get(target_stage_code)
        if not target_db_stage:
            target_db_stage = ProjectStage(
                project_id=project.id,
                stage_code=target_stage_code,
                sla_deadline_days=target_spec["sla_days"],
                assigned_role=target_spec["primary_role"],
            )
            db.add(target_db_stage)

        target_db_stage.status = StageStatus.IN_PROGRESS.value
        target_db_stage.started_at = now
        target_db_stage.due_date = today + timedelta(days=target_spec["sla_days"])
        target_db_stage.completed_at = None

        # 5. Update Project current_stage
        old_stage = project.current_stage
        project.current_stage = target_stage_code

        # 6. Record Transition History
        history = StageTransitionHistory(
            project_id=project.id,
            from_stage=old_stage,
            to_stage=target_stage_code,
            triggered_by_user_id=current_user.id,
            decision=decision,
            remarks=remarks or (rejection_reason if decision == TransitionDecision.REJECTED.value else "Standard transition approved"),
            snapshot_metrics_json={
                "land_acquired_acres": float(project.total_land_acquired_acres),
                "land_proposed_acres": float(project.total_land_proposed_acres),
                "compensation_disbursed_cr": float(project.compensation_disbursed_cr),
            },
            created_at=now,
        )
        db.add(history)

        # 7. Create Audit Log
        audit = AuditLog(
            user_id=current_user.id,
            action=f"STAGE_{decision}",
            entity_name="Project",
            entity_id=str(project.id),
            old_values={"current_stage": old_stage},
            new_values={
                "current_stage": target_stage_code,
                "decision": decision,
                "remarks": remarks,
                "rejection_reason": rejection_reason,
            },
            timestamp=now,
        )
        db.add(audit)

        # 8. Create Alert Notification
        alert_severity = "INFO" if decision == TransitionDecision.APPROVED.value else "WARNING"
        alert_title = (
            f"Stage Approved: {project.project_code} advanced to {target_spec['stage_name']}"
            if decision == TransitionDecision.APPROVED.value
            else f"Stage Rejected: {project.project_code} returned to {target_spec['stage_name']}"
        )
        alert_msg = (
            f"{current_user.full_name} ({current_user.role_id}) approved transition from {current_spec['stage_name']} to {target_spec['stage_name']}. SLA due in {target_spec['sla_days']} days."
            if decision == TransitionDecision.APPROVED.value
            else f"Rejection notice by {current_user.full_name}: {rejection_reason}. Rework required under {target_spec['stage_name']}."
        )

        alert = Alert(
            project_id=project.id,
            severity=alert_severity,
            category="WORKFLOW_TRANSITION",
            title=alert_title,
            message=alert_msg,
            target_role=target_spec["primary_role"],
            is_resolved=False,
            created_at=now,
        )
        db.add(alert)

        await db.commit()

        # Return updated timeline
        return await WorkflowEngine.get_project_workflow_timeline(db, project_id, current_user)

    @staticmethod
    async def get_workflow_tasks(
        db: AsyncSession,
        current_user: User,
        project_id: Optional[uuid.UUID] = None,
    ) -> List[WorkflowTaskItem]:
        """Fetch pending workflow tasks scoped to role & jurisdiction."""
        user_role = current_user.role_id

        stmt = (
            select(WorkflowTask)
            .options(
                selectinload(WorkflowTask.project).selectinload(Project.primary_district),
                selectinload(WorkflowTask.parcel),
                selectinload(WorkflowTask.role),
            )
            .order_by(desc(WorkflowTask.priority), WorkflowTask.due_date.asc())
        )

        if project_id:
            stmt = stmt.where(WorkflowTask.project_id == project_id)

        # Scoping: ADMIN and CENTRAL_OFFICER have national visibility across all tasks
        if user_role not in (RoleCode.ADMIN.value, RoleCode.CENTRAL_OFFICER.value):
            stmt = stmt.where(
                or_(
                    WorkflowTask.assigned_role == user_role,
                    WorkflowTask.assigned_user_id == current_user.id,
                )
            )

        result = await db.execute(stmt)
        tasks = result.scalars().all()

        today = date.today()
        task_items: List[WorkflowTaskItem] = []

        for t in tasks:
            # Check project jurisdiction
            if t.project and not WorkflowEngine._check_jurisdiction(t.project, current_user):
                continue

            is_overdue = (t.due_date and t.due_date < today and t.status != "COMPLETED")

            task_items.append(
                WorkflowTaskItem(
                    id=t.id,
                    project_id=t.project_id,
                    project_code=t.project.project_code if t.project else None,
                    project_title=t.project.title if t.project else None,
                    parcel_id=t.parcel_id,
                    khasra_number=t.parcel.khasra_number if t.parcel else None,
                    task_type=t.task_type,
                    title=t.title or f"{t.task_type.replace('_', ' ').title()}",
                    description=t.description or f"Action required for {t.project.project_code if t.project else 'corridor'}",
                    assigned_role=t.assigned_role,
                    assigned_role_name=t.role.name if t.role else t.assigned_role,
                    assigned_user_id=t.assigned_user_id,
                    status=t.status,
                    priority=t.priority,
                    due_date=t.due_date,
                    is_overdue=bool(is_overdue),
                    action_url=t.action_url or f"/projects/{t.project_id}",
                    created_at=t.created_at,
                )
            )

        return task_items

    @staticmethod
    async def action_workflow_task(
        db: AsyncSession,
        task_id: uuid.UUID,
        current_user: User,
        action: str,
        remarks: Optional[str] = None,
    ) -> WorkflowTaskItem:
        """Mark task completed or in review with audit logging."""
        stmt = (
            select(WorkflowTask)
            .where(WorkflowTask.id == task_id)
            .options(
                selectinload(WorkflowTask.project),
                selectinload(WorkflowTask.parcel),
                selectinload(WorkflowTask.role),
            )
        )
        result = await db.execute(stmt)
        task = result.scalar_one_or_none()

        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow task not found")

        # Authorization: must match assigned_role, assigned_user, or ADMIN
        if current_user.role_id != RoleCode.ADMIN.value and task.assigned_role != current_user.role_id and task.assigned_user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to action this task")

        now = datetime.now(timezone.utc)
        if action == "COMPLETE":
            task.status = "COMPLETED"
            task.completed_at = now
        elif action == "REJECT":
            task.status = "REJECTED"
        elif action == "IN_REVIEW":
            task.status = "IN_REVIEW"

        audit = AuditLog(
            user_id=current_user.id,
            action=f"TASK_{action}",
            entity_name="WorkflowTask",
            entity_id=str(task.id),
            new_values={"status": task.status, "remarks": remarks},
            timestamp=now,
        )
        db.add(audit)
        await db.commit()

        today = date.today()
        is_overdue = (task.due_date and task.due_date < today and task.status != "COMPLETED")

        return WorkflowTaskItem(
            id=task.id,
            project_id=task.project_id,
            project_code=task.project.project_code if task.project else None,
            project_title=task.project.title if task.project else None,
            parcel_id=task.parcel_id,
            khasra_number=task.parcel.khasra_number if task.parcel else None,
            task_type=task.task_type,
            title=task.title or f"{task.task_type.replace('_', ' ').title()}",
            description=task.description or "Task action completed",
            assigned_role=task.assigned_role,
            assigned_role_name=task.role.name if task.role else task.assigned_role,
            assigned_user_id=task.assigned_user_id,
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            is_overdue=bool(is_overdue),
            action_url=task.action_url,
            created_at=task.created_at,
        )

    @staticmethod
    def _check_jurisdiction(project: Project, user: User) -> bool:
        """Validate if user has statutory jurisdiction over the project."""
        user_role = user.role_id

        if user_role in (RoleCode.CENTRAL_OFFICER.value, RoleCode.ADMIN.value):
            return True

        if user_role in (RoleCode.DISTRICT_OFFICER.value, RoleCode.FIELD_OFFICER.value):
            if not user.district_id or not project.primary_district_id:
                return True
            return user.district_id == project.primary_district_id

        if user_role == RoleCode.STATE_OFFICER.value:
            if not user.state_id:
                return True
            if project.primary_district and project.primary_district.state_id:
                return user.state_id == project.primary_district.state_id
            return True

        if user_role == RoleCode.PROJECT_AGENCY.value:
            if user.organization and project.implementing_agency:
                return user.organization.lower() in project.implementing_agency.lower() or project.implementing_agency.lower() in user.organization.lower()
            return True

        return False
