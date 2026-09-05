import uuid
from datetime import date
from decimal import Decimal
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Numeric, Integer, Boolean, Date, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.parcel import LandParcel, LandOwner
    from app.models.user import User


class RAndRScheme(Base):
    __tablename__ = "randr_schemes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_reference: Mapped[Optional[str]] = mapped_column(String(50), unique=True, nullable=True, index=True)
    scheme_title: Mapped[str] = mapped_column(String(200), nullable=False)
    scheme_type: Mapped[str] = mapped_column(String(50), default="RESETTLEMENT_COLONY", nullable=False)
    resettlement_site_name: Mapped[str] = mapped_column(String(200), nullable=False)
    total_plots_planned: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_plots_allotted: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sanctioned_budget_cr: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.0"), nullable=False)
    spent_budget_cr: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.0"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="APPROVED", nullable=False)  # DRAFT, UNDER_REVIEW, APPROVED, ACTIVE, COMPLETED, ON_HOLD, CANCELLED
    target_completion_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    approval_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    approved_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="randr_schemes")
    approved_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[approved_by_user_id])
    families: Mapped[List["AffectedFamily"]] = relationship("AffectedFamily", back_populates="scheme", cascade="all, delete-orphan")
    allotments: Mapped[List["RAndRAllotment"]] = relationship("RAndRAllotment", back_populates="scheme")

    def __repr__(self) -> str:
        return f"<RAndRScheme(ref='{self.scheme_reference}', title='{self.scheme_title}', site='{self.resettlement_site_name}')>"


# Alias for compatibility with minimal entity naming
RAndRCase = RAndRScheme


class AffectedFamily(Base):
    __tablename__ = "affected_families"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scheme_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("randr_schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    family_reference_id: Mapped[Optional[str]] = mapped_column(String(50), unique=True, nullable=True, index=True)
    parcel_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("land_parcels.id", ondelete="SET NULL"), nullable=True, index=True)
    land_owner_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("land_owners.id", ondelete="SET NULL"), nullable=True, index=True)
    head_of_family_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    village_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    family_type: Mapped[str] = mapped_column(String(50), nullable=False)  # PAF_AFFECTED_ONLY or PDF_DISPLACED_REQUIRING_RELOCATION
    displacement_category: Mapped[str] = mapped_column(String(50), default="TITLEHOLDER_DISPLACED", nullable=False)
    social_category: Mapped[str] = mapped_column(String(20), default="GEN", nullable=False)
    family_members_count: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    contact_masked: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)

    # Entitlement & Assistance Fields
    entitled_plot_sqyd: Mapped[Decimal] = mapped_column(Numeric(8, 2), default=Decimal("0.0"), nullable=False)
    allotted_plot_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    subsistence_grant_inr: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.0"), nullable=False)
    transportation_allowance_inr: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.0"), nullable=False)
    one_time_resettlement_allowance_inr: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.0"), nullable=False)
    is_grant_disbursed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Configurable R&R Eligibility Assessment Fields
    eligibility_status: Mapped[str] = mapped_column(String(30), default="PENDING", nullable=False, index=True)  # PENDING, UNDER_REVIEW, ELIGIBLE, INELIGIBLE, DISPUTED, APPROVED
    eligibility_category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    eligibility_assessment_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    assessing_authority: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    eligibility_basis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    eligibility_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Lifecycle Status
    rehabilitation_status: Mapped[str] = mapped_column(String(30), default="SURVEYED", nullable=False, index=True)  # SURVEYED, SCHEME_APPROVED, PLOT_ALLOTTED, SETTLED

    # Relationships
    scheme: Mapped["RAndRScheme"] = relationship("RAndRScheme", back_populates="families")
    parcel: Mapped[Optional["LandParcel"]] = relationship("LandParcel", back_populates="affected_families")
    owner: Mapped[Optional["LandOwner"]] = relationship("LandOwner")
    allotments: Mapped[List["RAndRAllotment"]] = relationship("RAndRAllotment", back_populates="family", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<AffectedFamily(ref='{self.family_reference_id}', head='{self.head_of_family_name}', status='{self.rehabilitation_status}')>"


class RAndRAllotment(Base):
    __tablename__ = "randr_allotments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    family_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("affected_families.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("randr_schemes.id", ondelete="CASCADE"), nullable=True, index=True)
    allotment_reference: Mapped[Optional[str]] = mapped_column(String(50), unique=True, nullable=True, index=True)
    entitlement_category: Mapped[str] = mapped_column(String(50), default="HOUSING_RESETTLEMENT", nullable=False)
    allotment_type: Mapped[str] = mapped_column(String(50), nullable=False)  # PLOT, HOUSING_UNIT, SUBSISTENCE_ALLOWANCE, TRANSPORT_ALLOWANCE, LIVELIHOOD_GRANT
    asset_identifier: Mapped[str] = mapped_column(String(100), nullable=False)
    allotment_order_no: Mapped[str] = mapped_column(String(100), nullable=False)
    allotment_date: Mapped[date] = mapped_column(Date, nullable=False)
    delivery_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    allocated_value_inr: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0.0"), nullable=False)
    responsible_authority: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="ALLOTTED", nullable=False)  # PLANNED, APPROVED, ALLOCATED, IN_PROGRESS, DELIVERED, COMPLETED, ON_HOLD, CANCELLED
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    family: Mapped["AffectedFamily"] = relationship("AffectedFamily", back_populates="allotments")
    scheme: Mapped[Optional["RAndRScheme"]] = relationship("RAndRScheme", back_populates="allotments")

    def __repr__(self) -> str:
        return f"<RAndRAllotment(ref='{self.allotment_reference}', type='{self.allotment_type}', status='{self.status}')>"

