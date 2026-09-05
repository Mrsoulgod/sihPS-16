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
from app.models.notification import ObjectionsClaims, Notification
from app.models.randr import AffectedFamily, RAndRScheme
from app.schemas.risk import (
    RiskFactorItem,
    ProjectRiskDetail,
    RiskDistributionCount,
    HighRiskProjectLeaderboardItem,
    RiskOverviewResponse,
)
from app.services.analytics_service import AnalyticsService


class RiskService:
    # Configurable Statutory Risk Weights (must sum to 100%)
    WEIGHT_WORKFLOW_DELAY: float = 20.0
    WEIGHT_PARCEL_VERIFICATION: float = 20.0
    WEIGHT_COMPENSATION_FINANCIAL: float = 25.0
    WEIGHT_DISPUTES_OBJECTIONS: float = 15.0
    WEIGHT_RANDR_POSSESSION: float = 20.0

    @classmethod
    def calculate_project_risk_factors(
        cls,
        project: Project,
        overdue_tasks_count: int = 0,
        disputed_parcels_count: int = 0,
        unverified_parcels_count: int = 0,
        pending_objections_count: int = 0,
    ) -> Tuple[List[RiskFactorItem], int, str, List[str], List[str]]:
        """
        Deterministic, rule-based calculation of the 5 statutory risk factors.
        Returns: (factors_list, overall_score, risk_level, top_drivers, recommendations)
        """
        # 1. Factor 1: Workflow Delay Risk (Weight 20%)
        f1_score = min(100.0, float(overdue_tasks_count * 25.0 + (15.0 if str(project.current_stage).upper() in ("SECTION_15_HEARING", "COMPENSATION_ASSESSMENT") else 5.0)))
        if (project.risk_score or 0) > 0 and overdue_tasks_count == 0:
            # Respect stored benchmark baseline if higher
            f1_score = max(f1_score, min(100.0, float(project.risk_score or 0) * 0.9))

        f1_status = cls._get_factor_status(f1_score)
        f1_indicators = [
            f"{overdue_tasks_count} workflow tasks overdue past statutory SLA",
            f"Current milestone: {project.current_stage}",
        ]
        f1_explanation = (
            f"{overdue_tasks_count} statutory milestone tasks require immediate CALA / Agency action."
            if overdue_tasks_count > 0
            else "Workflow tasks progressing within prescribed RFCTLARR statutory timeline."
        )

        f1_item = RiskFactorItem(
            factor_id="F1-WORKFLOW-DELAY",
            factor_name="Workflow Delay & SLA Overrun Risk",
            weight_percent=cls.WEIGHT_WORKFLOW_DELAY,
            score=round(f1_score, 1),
            weighted_contribution=round(f1_score * (cls.WEIGHT_WORKFLOW_DELAY / 100.0), 2),
            status=f1_status,
            explanation=f1_explanation,
            key_indicators=f1_indicators,
        )

        # 2. Factor 2: Parcel Verification Risk (Weight 20%)
        total_parcels = len(project.parcels) or 1
        disputed_ratio = disputed_parcels_count / total_parcels
        f2_score = min(100.0, float(disputed_parcels_count * 22.0 + unverified_parcels_count * 12.0 + (disputed_ratio * 40.0)))
        if (project.risk_score or 0) >= 70:
            f2_score = max(f2_score, 75.0)

        f2_status = cls._get_factor_status(f2_score)
        f2_indicators = [
            f"{disputed_parcels_count} of {total_parcels} cadastral parcels flagged as disputed ({round(disputed_ratio * 100.0, 1)}%)",
            f"{unverified_parcels_count} parcels pending ground truth GIS verification",
        ]
        f2_explanation = (
            f"{disputed_parcels_count} disputed khasra boundaries require municipal / revenue reconciliation."
            if disputed_parcels_count > 0
            else "Cadastral ground verification and ownership records verified."
        )

        f2_item = RiskFactorItem(
            factor_id="F2-PARCEL-VERIFICATION",
            factor_name="Cadastral & Ground Verification Risk",
            weight_percent=cls.WEIGHT_PARCEL_VERIFICATION,
            score=round(f2_score, 1),
            weighted_contribution=round(f2_score * (cls.WEIGHT_PARCEL_VERIFICATION / 100.0), 2),
            status=f2_status,
            explanation=f2_explanation,
            key_indicators=f2_indicators,
        )

        # 3. Factor 3: Compensation & Financial Risk (Weight 25%)
        assessed_cr = float(project.compensation_assessed_cr or 0.0)
        disbursed_cr = float(project.compensation_disbursed_cr or 0.0)
        outstanding_cr = max(0.0, assessed_cr - disbursed_cr)
        disb_pct = (disbursed_cr / assessed_cr * 100.0) if assessed_cr > 0 else 0.0

        if assessed_cr > 0:
            f3_score = max(0.0, min(100.0, (100.0 - disb_pct) * 0.85 + (15.0 if outstanding_cr > 50.0 else 0.0)))
        else:
            f3_score = 30.0  # Assessment not yet finalized

        f3_status = cls._get_factor_status(f3_score)
        f3_indicators = [
            f"₹{round(disbursed_cr, 2)} Cr disbursed out of ₹{round(assessed_cr, 2)} Cr assessed ({round(disb_pct, 1)}%)",
            f"₹{round(outstanding_cr, 2)} Cr outstanding compensation balance",
        ]
        f3_explanation = (
            f"Disbursement backlog of ₹{round(outstanding_cr, 1)} Cr pending PFMS bank direct credit."
            if outstanding_cr > 5.0
            else "Compensation disbursement progressing steadily with minor outstanding balance."
        )

        f3_item = RiskFactorItem(
            factor_id="F3-COMPENSATION-FINANCIAL",
            factor_name="Compensation Disbursement & Financial Risk",
            weight_percent=cls.WEIGHT_COMPENSATION_FINANCIAL,
            score=round(f3_score, 1),
            weighted_contribution=round(f3_score * (cls.WEIGHT_COMPENSATION_FINANCIAL / 100.0), 2),
            status=f3_status,
            explanation=f3_explanation,
            key_indicators=f3_indicators,
        )

        # 4. Factor 4: Disputes & Section 15 Objections Risk (Weight 15%)
        f4_score = min(100.0, float(pending_objections_count * 25.0 + disputed_parcels_count * 15.0))
        if (project.risk_score or 0) >= 60:
            f4_score = max(f4_score, 55.0)

        f4_status = cls._get_factor_status(f4_score)
        f4_indicators = [
            f"{pending_objections_count} Section 15 objection hearings pending CALA speaking order",
            f"{disputed_parcels_count} legal title / mutation conflicts recorded",
        ]
        f4_explanation = (
            f"{pending_objections_count} objection cases pending statutory hearing and disposal."
            if pending_objections_count > 0
            else "No unresolved Section 15 claims or title disputes pending."
        )

        f4_item = RiskFactorItem(
            factor_id="F4-DISPUTES-OBJECTIONS",
            factor_name="Section 15 Objections & Title Dispute Risk",
            weight_percent=cls.WEIGHT_DISPUTES_OBJECTIONS,
            score=round(f4_score, 1),
            weighted_contribution=round(f4_score * (cls.WEIGHT_DISPUTES_OBJECTIONS / 100.0), 2),
            status=f4_status,
            explanation=f4_explanation,
            key_indicators=f4_indicators,
        )

        # 5. Factor 5: R&R Settlement & Possession Lag Risk (Weight 20%)
        rr_pct = float(project.randr_completion_percent or 0.0)
        proposed_acres = float(project.total_land_proposed_acres or 0.0)
        acquired_acres = float(project.total_land_acquired_acres or 0.0)
        poss_acres = float(project.total_possession_acres or 0.0)

        acq_pct = (acquired_acres / proposed_acres * 100.0) if proposed_acres > 0 else 0.0
        poss_pct = (poss_acres / proposed_acres * 100.0) if proposed_acres > 0 else 0.0
        poss_lag = max(0.0, acq_pct - poss_pct)

        f5_score = max(0.0, min(100.0, (100.0 - rr_pct) * 0.55 + poss_lag * 0.8))
        f5_status = cls._get_factor_status(f5_score)
        f5_indicators = [
            f"R&R settlement completion at {round(rr_pct, 1)}% ({project.total_paf_count or 0} PAFs)",
            f"Possession lag of {round(poss_lag, 1)}% between Section 19 acquisition and Section 38 handover",
        ]
        f5_explanation = (
            f"Resettlement progress ({round(rr_pct, 1)}%) and possession handover lag ({round(poss_lag, 1)}%) need synchronization."
            if (rr_pct < 80.0 or poss_lag > 10.0)
            else "R&R entitlements disbursed and possession handover completed without friction."
        )

        f5_item = RiskFactorItem(
            factor_id="F5-RANDR-POSSESSION",
            factor_name="R&R Settlement & Possession Handover Lag",
            weight_percent=cls.WEIGHT_RANDR_POSSESSION,
            score=round(f5_score, 1),
            weighted_contribution=round(f5_score * (cls.WEIGHT_RANDR_POSSESSION / 100.0), 2),
            status=f5_status,
            explanation=f5_explanation,
            key_indicators=f5_indicators,
        )

        factors = [f1_item, f2_item, f3_item, f4_item, f5_item]

        # Calculate Overall Risk Score = sum(weighted_contributions)
        raw_overall = sum(f.weighted_contribution for f in factors)
        overall_score = int(round(raw_overall))

        # Respect stored baseline if project has explicit calibrated risk score
        if (project.risk_score or 0) > 0:
            overall_score = int(round((overall_score * 0.4) + ((project.risk_score or 0) * 0.6)))

        overall_score = max(0, min(100, overall_score))
        risk_level = cls._get_risk_level(overall_score)

        # Identify Top Risk Drivers
        sorted_factors = sorted(factors, key=lambda x: x.weighted_contribution, reverse=True)
        top_drivers: List[str] = []
        for f in sorted_factors[:3]:
            if f.score >= 35.0:
                top_drivers.append(f"{f.factor_name} ({f.score}/100) — {f.explanation}")

        if not top_drivers:
            top_drivers.append("All statutory indicators currently operating within low risk thresholds.")

        # Generate Actionable Decision-Support Recommendations
        recommendations: List[str] = []
        if overdue_tasks_count > 0:
            recommendations.append(f"Accelerate CALA disposal for {overdue_tasks_count} overdue statutory workflow tasks.")
        if outstanding_cr > 10.0:
            recommendations.append(f"Expedite PFMS batch validation to disburse outstanding ₹{round(outstanding_cr, 1)} Cr compensation.")
        if disputed_parcels_count > 0:
            recommendations.append(f"Convene joint Revenue-CALA survey for {disputed_parcels_count} disputed khasra polygons.")
        if pending_objections_count > 0:
            recommendations.append(f"Schedule fast-track hearing sessions for {pending_objections_count} Section 15 objections.")
        if rr_pct < 70.0:
            recommendations.append(f"Issue expedited plot allotment orders for PAFs in the model resettlement colony.")
        if not recommendations:
            recommendations.append("Continue routine statutory monitoring and progress verification.")

        return factors, overall_score, risk_level, top_drivers, recommendations

    @staticmethod
    def _get_factor_status(score: float) -> str:
        if score >= 75.0:
            return "CRITICAL"
        elif score >= 50.0:
            return "HIGH"
        elif score >= 25.0:
            return "MODERATE"
        return "LOW"

    @staticmethod
    def _get_risk_level(score: int) -> str:
        if score >= 75:
            return "CRITICAL"
        elif score >= 50:
            return "HIGH"
        elif score >= 25:
            return "MODERATE"
        return "LOW"

    @classmethod
    async def get_project_risk_detail(
        cls,
        db: AsyncSession,
        project_id: uuid.UUID,
    ) -> Optional[ProjectRiskDetail]:
        """Fetch and calculate the complete 5-factor risk intelligence for a single project."""
        stmt = (
            select(Project)
            .options(
                selectinload(Project.primary_district).selectinload(District.state),
                selectinload(Project.workflow_tasks),
                selectinload(Project.parcels),
                selectinload(Project.notifications).selectinload(Notification.objections),
            )
            .where(Project.id == project_id)
        )
        res = await db.execute(stmt)
        project = res.scalar_one_or_none()
        if not project:
            return None

        # Count indicators
        overdue_tasks = sum(
            1 for t in project.workflow_tasks
            if t.status == "PENDING" and t.due_date and t.due_date < date.today()
        )
        disputed_parcels = sum(1 for p in project.parcels if p.is_disputed)
        unverified_parcels = sum(1 for p in project.parcels if p.acquisition_status == "PROPOSED")

        pending_objections = 0
        for notif in project.notifications:
            pending_objections += sum(1 for obj in notif.objections if obj.disposal_status == "PENDING")

        factors, overall_score, risk_level, top_drivers, recommendations = cls.calculate_project_risk_factors(
            project,
            overdue_tasks_count=overdue_tasks,
            disputed_parcels_count=disputed_parcels,
            unverified_parcels_count=unverified_parcels,
            pending_objections_count=pending_objections,
        )

        state_name = project.primary_district.state.name if project.primary_district and project.primary_district.state else None
        dist_name = project.primary_district.name if project.primary_district else None
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

        return ProjectRiskDetail(
            project_id=project.id,
            project_code=project.project_code,
            title=project.title,
            state_name=state_name,
            district_name=dist_name,
            current_stage=project.current_stage,
            overall_risk_score=overall_score,
            risk_level=risk_level,
            factors=factors,
            top_risk_drivers=top_drivers,
            decision_support_recommendations=recommendations,
            assessment_timestamp=now_str,
        )

    @classmethod
    async def get_risk_overview(
        cls,
        db: AsyncSession,
        current_user: Optional[User] = None,
        filter_state_id: Optional[str] = None,
        filter_district_id: Optional[str] = None,
    ) -> RiskOverviewResponse:
        """Compute portfolio risk distribution and identify top high-risk projects."""
        scope_level, jurisdiction_name, _, _, _ = AnalyticsService._resolve_scope(
            current_user, filter_state_id, filter_district_id
        )
        projects = await AnalyticsService.get_scoped_projects(
            db, current_user, filter_state_id, filter_district_id
        )

        low_count = 0
        mod_count = 0
        high_count = 0
        crit_count = 0

        leaderboard_items: List[HighRiskProjectLeaderboardItem] = []

        for p in projects:
            overdue_tasks = sum(
                1 for t in p.workflow_tasks
                if t.status == "PENDING" and t.due_date and t.due_date < date.today()
            )
            disputed_parcels = sum(1 for parcel in p.parcels if parcel.is_disputed)
            unverified_parcels = sum(1 for parcel in p.parcels if parcel.acquisition_status == "PROPOSED")

            factors, overall_score, risk_level, top_drivers, recs = cls.calculate_project_risk_factors(
                p,
                overdue_tasks_count=overdue_tasks,
                disputed_parcels_count=disputed_parcels,
                unverified_parcels_count=unverified_parcels,
                pending_objections_count=0,
            )

            if overall_score >= 75:
                crit_count += 1
            elif overall_score >= 50:
                high_count += 1
            elif overall_score >= 25:
                mod_count += 1
            else:
                low_count += 1

            state_name = p.primary_district.state.name if p.primary_district and p.primary_district.state else None
            dist_name = p.primary_district.name if p.primary_district else None

            leaderboard_items.append(
                HighRiskProjectLeaderboardItem(
                    project_id=p.id,
                    project_code=p.project_code,
                    title=p.title,
                    state_name=state_name,
                    district_name=dist_name,
                    risk_score=overall_score,
                    risk_level=risk_level,
                    primary_driver=top_drivers[0] if top_drivers else "Normal operations",
                    recommended_action=recs[0] if recs else "Monitor statutory SLA",
                )
            )

        # Sort leaderboard by risk_score desc
        leaderboard_items.sort(key=lambda x: x.risk_score, reverse=True)

        distribution = RiskDistributionCount(
            low_count=low_count,
            moderate_count=mod_count,
            high_count=high_count,
            critical_count=crit_count,
            total_projects=len(projects),
        )

        factor_benchmarks = [
            {"factor_id": "F1", "name": "Workflow Delay Risk", "weight": f"{cls.WEIGHT_WORKFLOW_DELAY}%", "description": "Measures statutory SLA task overrun and milestone lag."},
            {"factor_id": "F2", "name": "Cadastral Verification Risk", "weight": f"{cls.WEIGHT_PARCEL_VERIFICATION}%", "description": "Measures disputed parcels and ground verification backlogs."},
            {"factor_id": "F3", "name": "Compensation Financial Risk", "weight": f"{cls.WEIGHT_COMPENSATION_FINANCIAL}%", "description": "Measures outstanding compensation and PFMS disbursement velocity."},
            {"factor_id": "F4", "name": "Disputes & Objections Risk", "weight": f"{cls.WEIGHT_DISPUTES_OBJECTIONS}%", "description": "Measures Section 15 pending objections and legal contestations."},
            {"factor_id": "F5", "name": "R&R & Possession Lag Risk", "weight": f"{cls.WEIGHT_RANDR_POSSESSION}%", "description": "Measures PAF rehabilitation progress and possession handover delay."},
        ]

        return RiskOverviewResponse(
            scope_level=scope_level,
            jurisdiction_name=jurisdiction_name,
            distribution=distribution,
            top_high_risk_projects=leaderboard_items,
            factor_benchmarks=factor_benchmarks,
        )
