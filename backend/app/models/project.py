import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Numeric, Integer, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.role import Role
    from app.models.location import District
    from app.models.parcel import LandParcel
    from app.models.notification import Notification
    from app.models.award import Award
    from app.models.possession import Possession
    from app.models.randr import RAndRScheme
    from app.models.alert import Alert


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    sponsoring_ministry: Mapped[str] = mapped_column(String(100), nullable=False)
    implementing_agency: Mapped[str] = mapped_column(String(100), nullable=False)
    current_stage: Mapped[str] = mapped_column(String(40), default="PROJECT_PROPOSAL", nullable=False, index=True)
    primary_district_id: Mapped[Optional[str]] = mapped_column(String(10), ForeignKey("districts.id"), nullable=True, index=True)
    total_land_proposed_acres: Mapped[Decimal] = mapped_column(Numeric(10, 4), nullable=False)
    total_land_acquired_acres: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=Decimal("0.0"), nullable=False)
    total_possession_acres: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=Decimal("0.0"), nullable=False)
    estimated_budget_inr_cr: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    compensation_assessed_cr: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.0"), nullable=False)
    compensation_disbursed_cr: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.0"), nullable=False)
    total_paf_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_pdf_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    randr_completion_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.0"), nullable=False)
    alignment_geojson: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)
    risk_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    # Relationships
    created_by: Mapped["User"] = relationship("User", back_populates="created_projects", foreign_keys=[created_by_user_id])
    primary_district: Mapped[Optional["District"]] = relationship("District", back_populates="projects")
    stages: Mapped[List["ProjectStage"]] = relationship("ProjectStage", back_populates="project", cascade="all, delete-orphan")
    stage_history: Mapped[List["StageTransitionHistory"]] = relationship("StageTransitionHistory", back_populates="project", cascade="all, delete-orphan")
    workflow_tasks: Mapped[List["WorkflowTask"]] = relationship("WorkflowTask", back_populates="project", cascade="all, delete-orphan")
    parcels: Mapped[List["LandParcel"]] = relationship("LandParcel", back_populates="project", cascade="all, delete-orphan")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="project", cascade="all, delete-orphan")
    awards: Mapped[List["Award"]] = relationship("Award", back_populates="project")
    possessions: Mapped[List["Possession"]] = relationship("Possession", back_populates="project")
    randr_schemes: Mapped[List["RAndRScheme"]] = relationship("RAndRScheme", back_populates="project", cascade="all, delete-orphan")
    alerts: Mapped[List["Alert"]] = relationship("Alert", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Project(code='{self.project_code}', title='{self.title}', stage='{self.current_stage}')>"


class ProjectStage(Base):
    __tablename__ = "project_stages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    stage_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default="PENDING", nullable=False)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    sla_deadline_days: Mapped[int] = mapped_column(Integer, default=30, nullable=False)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="stages")


class StageTransitionHistory(Base):
    __tablename__ = "stage_transition_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    from_stage: Mapped[str] = mapped_column(String(50), nullable=False)
    to_stage: Mapped[str] = mapped_column(String(50), nullable=False)
    triggered_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    decision: Mapped[str] = mapped_column(String(20), nullable=False)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    snapshot_metrics_json: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="stage_history")
    triggered_by: Mapped["User"] = relationship("User", foreign_keys=[triggered_by_user_id])


class WorkflowTask(Base):
    __tablename__ = "workflow_tasks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    task_type: Mapped[str] = mapped_column(String(50), nullable=False)
    assigned_role: Mapped[str] = mapped_column(String(36), ForeignKey("roles.id"), nullable=False, index=True)
    assigned_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(20), default="PENDING", nullable=False, index=True)
    priority: Mapped[str] = mapped_column(String(20), default="NORMAL", nullable=False)
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    action_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="workflow_tasks")
    role: Mapped["Role"] = relationship("Role")
    assigned_user: Mapped[Optional["User"]] = relationship("User", back_populates="assigned_tasks", foreign_keys=[assigned_user_id])
