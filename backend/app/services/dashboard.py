import uuid
from decimal import Decimal
from typing import Optional, List, Dict, Any
from sqlalchemy import select, func, desc, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.project import Project
from app.models.location import State, District
from app.models.audit import AuditLog
from app.models.role import Role
from app.schemas.dashboard import (
    DashboardKpiSummary,
    AcquisitionOverview,
    ProjectStatusCounts,
    StateProgressItem,
    AttentionProjectItem,
    RecentActivityItem,
    QuickActionItem,
    DashboardSummaryResponse,
)


class DashboardService:
    @staticmethod
    async def get_dashboard_summary(
        db: AsyncSession,
        current_user: User,
        filter_state_id: Optional[str] = None,
        filter_district_id: Optional[str] = None,
    ) -> DashboardSummaryResponse:
        """
        Generate authoritative aggregated dashboard summary with strict role and jurisdiction scoping.
        """
        # 1. Determine Scope Level & Jurisdiction Label
        user_role = current_user.role_id
        scope_level = "NATIONAL"
        jurisdiction_name = "All India (National Command View)"

        scoped_state_id: Optional[str] = filter_state_id
        scoped_district_id: Optional[str] = filter_district_id
        scoped_agency: Optional[str] = None

        if user_role == "ROLE_STATE_OFFICER":
            scope_level = "STATE"
            scoped_state_id = current_user.state_id
            state_obj = await db.get(State, scoped_state_id) if scoped_state_id else None
            jurisdiction_name = f"{state_obj.name if state_obj else scoped_state_id} (State View)"

        elif user_role in ("ROLE_DISTRICT_OFFICER", "ROLE_FIELD_OFFICER"):
            scope_level = "DISTRICT" if user_role == "ROLE_DISTRICT_OFFICER" else "FIELD"
            scoped_district_id = current_user.district_id
            scoped_state_id = current_user.state_id
            dist_obj = await db.get(District, scoped_district_id) if scoped_district_id else None
            jurisdiction_name = f"{dist_obj.name if dist_obj else scoped_district_id} District ({'CALA Authority' if user_role == 'ROLE_DISTRICT_OFFICER' else 'Field Operations'})"

        elif user_role == "ROLE_PROJECT_AGENCY":
            scope_level = "AGENCY"
            scoped_agency = current_user.organization
            jurisdiction_name = f"{current_user.organization} (Implementing Agency View)"

        elif user_role == "ROLE_ADMIN":
            scope_level = "SYSTEM"
            jurisdiction_name = "National Command Center (Administrator Overview)"

        # 2. Query Projects with Scoping
        project_query = (
            select(Project)
            .options(
                selectinload(Project.primary_district).selectinload(District.state),
            )
        )

        if scoped_district_id:
            project_query = project_query.where(Project.primary_district_id == scoped_district_id)
        elif scoped_state_id:
            project_query = project_query.join(District, Project.primary_district_id == District.id).where(
                District.state_id == scoped_state_id
            )

        if scoped_agency:
            project_query = project_query.where(
                or_(
                    Project.implementing_agency.ilike(f"%{scoped_agency}%"),
                    Project.created_by_user_id == current_user.id,
                )
            )

        result = await db.execute(project_query)
        projects = result.scalars().all()

        # 3. Calculate Core Aggregated KPIs
        total_projects = len(projects)
        total_proposed = sum(float(p.total_land_proposed_acres) for p in projects)
        total_acquired = sum(float(p.total_land_acquired_acres) for p in projects)
        total_possession = sum(float(p.total_possession_acres) for p in projects)
        remaining_land = max(0.0, total_proposed - total_acquired)

        acq_pct = round((total_acquired / total_proposed * 100.0), 1) if total_proposed > 0 else 0.0
        poss_pct = round((total_possession / total_proposed * 100.0), 1) if total_proposed > 0 else 0.0

        total_assessed_cr = sum(float(p.compensation_assessed_cr) for p in projects)
        total_disbursed_cr = sum(float(p.compensation_disbursed_cr) for p in projects)
        disb_pct = round((total_disbursed_cr / total_assessed_cr * 100.0), 1) if total_assessed_cr > 0 else 0.0

        total_pafs = sum(p.total_paf_count for p in projects)
        total_pdfs = sum(p.total_pdf_count for p in projects)
        avg_randr = round((sum(float(p.randr_completion_percent) for p in projects) / total_projects), 1) if total_projects > 0 else 0.0

        kpis = DashboardKpiSummary(
            total_projects=total_projects,
            total_land_proposed_acres=round(total_proposed, 2),
            total_land_acquired_acres=round(total_acquired, 2),
            total_possession_acres=round(total_possession, 2),
            overall_acquisition_percent=acq_pct,
            compensation_assessed_cr=round(total_assessed_cr, 2),
            compensation_disbursed_cr=round(total_disbursed_cr, 2),
            overall_disbursement_percent=disb_pct,
            total_paf_count=total_pafs,
            total_pdf_count=total_pdfs,
            avg_randr_completion_percent=avg_randr,
        )

        acq_overview = AcquisitionOverview(
            land_proposed_acres=round(total_proposed, 2),
            land_acquired_acres=round(total_acquired, 2),
            land_remaining_acres=round(remaining_land, 2),
            acquisition_percent=acq_pct,
            possession_acres=round(total_possession, 2),
            possession_percent=poss_pct,
        )

        # 4. Project Status Breakdown
        on_track = 0
        at_risk = 0
        delayed = 0
        completed = 0

        attention_items: List[AttentionProjectItem] = []

        for p in projects:
            stage_str = str(p.current_stage).upper()
            progress = (
                round(float(p.total_land_acquired_acres) / float(p.total_land_proposed_acres) * 100.0, 1)
                if float(p.total_land_proposed_acres) > 0
                else 0.0
            )

            state_name = p.primary_district.state.name if p.primary_district and p.primary_district.state else None
            dist_name = p.primary_district.name if p.primary_district else None

            if stage_str in ("COMPLETION", "COMPLETED"):
                p_status = "COMPLETED"
                completed += 1
            elif p.risk_score >= 70:
                p_status = "DELAYED"
                delayed += 1
            elif p.risk_score >= 50:
                p_status = "AT_RISK"
                at_risk += 1
            else:
                p_status = "ON_TRACK"
                on_track += 1

            if p_status in ("AT_RISK", "DELAYED"):
                reason = "Statutory milestone timeline breach"
                if p.risk_score >= 70:
                    reason = "Cadastral boundary reconciliation & municipal alignment clearance pending"
                elif p.risk_score >= 50:
                    reason = "Compensation disbursement backlog in Kotputli Tehsil; Section 15 objection hearing pending"

                attention_items.append(
                    AttentionProjectItem(
                        id=p.id,
                        project_code=p.project_code,
                        title=p.title,
                        state_name=state_name,
                        district_name=dist_name,
                        current_stage=p.current_stage,
                        acquisition_progress_percent=progress,
                        status=p_status,
                        reason=reason,
                        risk_score=p.risk_score,
                    )
                )

        status_counts = ProjectStatusCounts(
            on_track=on_track,
            at_risk=at_risk,
            delayed=delayed,
            completed=completed,
            total=total_projects,
        )

        # Sort attention projects by risk_score desc
        attention_items.sort(key=lambda x: x.risk_score, reverse=True)

        # 5. State-wise Progress Aggregations
        # Fetch all states to calculate comparative progress
        state_stmt = select(State).order_by(State.name)
        all_states = (await db.execute(state_stmt)).scalars().all()
        state_progress_list: List[StateProgressItem] = []

        for st in all_states:
            # Check if this state should be shown (if scoped to a specific state, only show that state)
            if scoped_state_id and st.id != scoped_state_id:
                continue

            st_projects = [
                p for p in projects if p.primary_district and p.primary_district.state_id == st.id
            ]
            if not st_projects:
                # Also check database directly if not filtered in current project list
                direct_stmt = (
                    select(Project)
                    .join(District, Project.primary_district_id == District.id)
                    .where(District.state_id == st.id)
                )
                direct_res = await db.execute(direct_stmt)
                st_projects = direct_res.scalars().all()

            st_count = len(st_projects)
            st_proposed = sum(float(p.total_land_proposed_acres) for p in st_projects)
            st_acquired = sum(float(p.total_land_acquired_acres) for p in st_projects)
            st_disbursed = sum(float(p.compensation_disbursed_cr) for p in st_projects)
            st_acq_pct = round((st_acquired / st_proposed * 100.0), 1) if st_proposed > 0 else 0.0
            st_randr_avg = (
                round(sum(float(p.randr_completion_percent) for p in st_projects) / st_count, 1)
                if st_count > 0
                else 0.0
            )

            if st_acq_pct >= 80.0:
                perf = "STRONG"
            elif st_acq_pct >= 40.0:
                perf = "MODERATE"
            else:
                perf = "POOR"

            state_progress_list.append(
                StateProgressItem(
                    state_id=st.id,
                    state_name=st.name,
                    project_count=st_count,
                    land_proposed_acres=round(st_proposed, 2),
                    land_acquired_acres=round(st_acquired, 2),
                    acquisition_percent=st_acq_pct,
                    compensation_disbursed_cr=round(st_disbursed, 2),
                    randr_completion_percent=st_randr_avg,
                    performance_category=perf,
                )
            )

        # Sort state progress by acquisition_percent desc
        state_progress_list.sort(key=lambda x: x.acquisition_percent, reverse=True)

        # 6. Query Recent Activity from AuditLog
        activity_stmt = (
            select(AuditLog)
            .options(
                selectinload(AuditLog.user).selectinload(User.role),
            )
            .order_by(desc(AuditLog.timestamp))
            .limit(8)
        )
        activity_res = await db.execute(activity_stmt)
        audit_rows = activity_res.scalars().all()

        recent_activity: List[RecentActivityItem] = []
        for a in audit_rows:
            actor_name = a.user.full_name if a.user else "System Automation"
            actor_role = a.user.role.name if a.user and a.user.role else "System"
            recent_activity.append(
                RecentActivityItem(
                    id=a.id,
                    action=a.action,
                    entity_name=a.entity_name,
                    entity_id=str(a.entity_id),
                    actor_name=actor_name,
                    actor_role=actor_role,
                    details=a.new_values if isinstance(a.new_values, dict) else None,
                    timestamp=a.timestamp,
                )
            )

        # 7. Generate Role-Aware Quick Actions
        quick_actions = DashboardService._get_role_quick_actions(user_role)

        return DashboardSummaryResponse(
            scope_level=scope_level,
            jurisdiction_name=jurisdiction_name,
            kpis=kpis,
            acquisition_overview=acq_overview,
            status_breakdown=status_counts,
            state_progress=state_progress_list,
            attention_projects=attention_items,
            recent_activity=recent_activity,
            quick_actions=quick_actions,
        )

    @staticmethod
    def _get_role_quick_actions(role_id: str) -> List[QuickActionItem]:
        """Return tailored actions based on user's statutory persona."""
        if role_id == "ROLE_CENTRAL_OFFICER":
            return [
                QuickActionItem(
                    id="qa-central-1",
                    label="National Project Pipeline",
                    description="Monitor all interstate corridor acquisitions",
                    target_route="/projects",
                    badge="5 Active",
                    icon="Building2",
                ),
                QuickActionItem(
                    id="qa-central-2",
                    label="Sanction New Requisition",
                    description="Issue administrative sanction for DPR",
                    target_route="/workflow",
                    badge="Phase 3",
                    icon="FileCheck",
                ),
                QuickActionItem(
                    id="qa-central-3",
                    label="MIS Executive Summary",
                    description="Export national land acquisition & spend report",
                    target_route="/reports",
                    badge="PDF / Excel",
                    icon="BarChart3",
                ),
            ]
        elif role_id == "ROLE_STATE_OFFICER":
            return [
                QuickActionItem(
                    id="qa-state-1",
                    label="State Gazette Oversight",
                    description="Track Section 11 & Section 19 declarations",
                    target_route="/notifications",
                    badge="Revenue Dept",
                    icon="Newspaper",
                ),
                QuickActionItem(
                    id="qa-state-2",
                    label="Inter-District Review",
                    description="Identify bottlenecks across district CALAs",
                    target_route="/projects",
                    badge="4 Districts",
                    icon="Layers",
                ),
                QuickActionItem(
                    id="qa-state-3",
                    label="R&R Colony Monitoring",
                    description="Inspect rehabilitation plot allotments",
                    target_route="/randr",
                    badge="Phase 6",
                    icon="Home",
                ),
            ]
        elif role_id == "ROLE_DISTRICT_OFFICER":
            return [
                QuickActionItem(
                    id="qa-dist-1",
                    label="Section 15 Objection Hearings",
                    description="Review pending claims & record speaking orders",
                    target_route="/notifications",
                    badge="2 Pending",
                    icon="Gavel",
                ),
                QuickActionItem(
                    id="qa-dist-2",
                    label="Section 23 Award Declaration",
                    description="Sign statutory compensation awards with e-Sign",
                    target_route="/awards",
                    badge="Phase 5",
                    icon="FileBadge",
                ),
                QuickActionItem(
                    id="qa-dist-3",
                    label="Authorize PFMS Batch",
                    description="Approve direct benefit transfer compensation",
                    target_route="/disbursements",
                    badge="₹42.50 Cr",
                    icon="CreditCard",
                ),
            ]
        elif role_id == "ROLE_PROJECT_AGENCY":
            return [
                QuickActionItem(
                    id="qa-agency-1",
                    label="Submit Project DPR",
                    description="Upload new highway corridor alignment KML",
                    target_route="/projects",
                    badge="NHAI / DMRC",
                    icon="UploadCloud",
                ),
                QuickActionItem(
                    id="qa-agency-2",
                    label="Deposit Compensation",
                    description="Transfer land acquisition funds to CALA escrow",
                    target_route="/compensation",
                    badge="Phase 5",
                    icon="Wallet",
                ),
                QuickActionItem(
                    id="qa-agency-3",
                    label="Possession Handover",
                    description="Receive Section 38 encumbrance-free certificates",
                    target_route="/possession",
                    badge="Phase 5",
                    icon="ShieldCheck",
                ),
            ]
        elif role_id == "ROLE_FIELD_OFFICER":
            return [
                QuickActionItem(
                    id="qa-field-1",
                    label="Cadastral Ground Truthing",
                    description="Verify Khasra parcel boundaries on site",
                    target_route="/parcels",
                    badge="Kotputli Tehsil",
                    icon="MapPin",
                ),
                QuickActionItem(
                    id="qa-field-2",
                    label="Asset Valuation Survey",
                    description="Enumerate structures, fruit trees, and borewells",
                    target_route="/compensation",
                    badge="Phase 5",
                    icon="Calculator",
                ),
                QuickActionItem(
                    id="qa-field-3",
                    label="Landowner KYC Verification",
                    description="Check Aadhaar and bank account match",
                    target_route="/owners",
                    badge="Revenue Record",
                    icon="UserCheck",
                ),
            ]
        else:  # ADMIN
            return [
                QuickActionItem(
                    id="qa-admin-1",
                    label="Officer Provisioning",
                    description="Manage administrative accounts & jurisdictions",
                    target_route="/admin/users",
                    badge="6 Officers",
                    icon="Users",
                ),
                QuickActionItem(
                    id="qa-admin-2",
                    label="Audit Trail Explorer",
                    description="Inspect tamper-proof system logs & diffs",
                    target_route="/audit",
                    badge="38 Logs",
                    icon="FileText",
                ),
                QuickActionItem(
                    id="qa-admin-3",
                    label="PostGIS Telemetry",
                    description="Inspect spatial database health & connections",
                    target_route="/api/health",
                    badge="PostGIS 3.6.2",
                    icon="Database",
                ),
            ]
