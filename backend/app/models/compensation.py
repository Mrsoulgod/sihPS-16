import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Numeric, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.parcel import LandParcel
    from app.models.user import User
    from app.models.award import Award


class CompensationAssessment(Base):
    __tablename__ = "compensation_assessments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parcel_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("land_parcels.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    assessment_reference: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(30), default="APPROVED", nullable=False, index=True)
    base_land_value_inr: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    multiplier_factor: Mapped[Decimal] = mapped_column(Numeric(4, 2), default=Decimal("1.00"), nullable=False)
    market_value_land_inr: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    assets_value_inr: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0.0"), nullable=False)
    solatium_inr: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    additional_market_value_inr: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    total_compensation_inr: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    is_approved_by_cala: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    approval_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    assessing_officer_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    award_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("awards.id", ondelete="SET NULL"), nullable=True, index=True)

    # Relationships
    parcel: Mapped["LandParcel"] = relationship("LandParcel", back_populates="compensation")
    asset_valuations: Mapped[List["AssetValuation"]] = relationship("AssetValuation", back_populates="assessment", cascade="all, delete-orphan")
    assessing_officer: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assessing_officer_id])
    award: Mapped[Optional["Award"]] = relationship("Award", back_populates="compensation_assessments")

    def __repr__(self) -> str:
        return f"<CompensationAssessment(ref='{self.assessment_reference}', parcel_id='{self.parcel_id}', total_inr={self.total_compensation_inr})>"


# Alias for compatibility with minimal entity naming
Compensation = CompensationAssessment


class AssetValuation(Base):
    __tablename__ = "asset_valuations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("compensation_assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_category: Mapped[str] = mapped_column(String(30), nullable=False)
    description: Mapped[str] = mapped_column(String(200), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    unit_rate_inr: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total_asset_value_inr: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    depreciation_inr: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.0"), nullable=False)
    net_asset_value_inr: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    # Relationships
    assessment: Mapped["CompensationAssessment"] = relationship("CompensationAssessment", back_populates="asset_valuations")
