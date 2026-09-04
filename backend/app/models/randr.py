import uuid
from datetime import date
from decimal import Decimal
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Numeric, Integer, Boolean, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.project import Project


class RAndRScheme(Base):
    __tablename__ = "randr_schemes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_title: Mapped[str] = mapped_column(String(200), nullable=False)
    resettlement_site_name: Mapped[str] = mapped_column(String(200), nullable=False)
    total_plots_planned: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_plots_allotted: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sanctioned_budget_cr: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.0"), nullable=False)
    spent_budget_cr: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.0"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="SANCTIONED", nullable=False)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="randr_schemes")
    families: Mapped[List["AffectedFamily"]] = relationship("AffectedFamily", back_populates="scheme", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<RAndRScheme(title='{self.scheme_title}', site='{self.resettlement_site_name}')>"


# Alias for compatibility with minimal entity naming
RAndRCase = RAndRScheme


class AffectedFamily(Base):
    __tablename__ = "affected_families"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scheme_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("randr_schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    head_of_family_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    family_type: Mapped[str] = mapped_column(String(30), nullable=False)  # PAF_AFFECTED_ONLY or PDF_DISPLACED_REQUIRING_RELOCATION
    social_category: Mapped[str] = mapped_column(String(20), default="GEN", nullable=False)
    entitled_plot_sqyd: Mapped[Decimal] = mapped_column(Numeric(8, 2), default=Decimal("0.0"), nullable=False)
    allotted_plot_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    subsistence_grant_inr: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.0"), nullable=False)
    transportation_allowance_inr: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.0"), nullable=False)
    one_time_resettlement_allowance_inr: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.0"), nullable=False)
    is_grant_disbursed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    rehabilitation_status: Mapped[str] = mapped_column(String(30), default="SURVEYED", nullable=False, index=True)

    # Relationships
    scheme: Mapped["RAndRScheme"] = relationship("RAndRScheme", back_populates="families")
    allotments: Mapped[List["RAndRAllotment"]] = relationship("RAndRAllotment", back_populates="family", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<AffectedFamily(head='{self.head_of_family_name}', type='{self.family_type}', status='{self.rehabilitation_status}')>"


class RAndRAllotment(Base):
    __tablename__ = "randr_allotments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    family_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("affected_families.id", ondelete="CASCADE"), nullable=False, index=True)
    allotment_type: Mapped[str] = mapped_column(String(50), nullable=False)
    asset_identifier: Mapped[str] = mapped_column(String(100), nullable=False)
    allotment_order_no: Mapped[str] = mapped_column(String(100), nullable=False)
    allotment_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="ALLOTTED", nullable=False)

    # Relationships
    family: Mapped["AffectedFamily"] = relationship("AffectedFamily", back_populates="allotments")
