import uuid
from datetime import date
from decimal import Decimal
from typing import List, Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Numeric, Integer, Boolean, Date, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.location import Village
    from app.models.user import User
    from app.models.compensation import CompensationAssessment
    from app.models.disbursement import Disbursement
    from app.models.possession import Possession
    from app.models.notification import ObjectionsClaims


class LandParcel(Base):
    __tablename__ = "land_parcels"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    village_id: Mapped[str] = mapped_column(String(20), ForeignKey("villages.id"), nullable=False, index=True)
    khasra_number: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    khata_number: Mapped[str] = mapped_column(String(50), nullable=False)
    total_area_sqm: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    acquired_area_sqm: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    land_type: Mapped[str] = mapped_column(String(30), nullable=False)
    circle_rate_per_sqm: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    market_multiplier: Mapped[Decimal] = mapped_column(Numeric(4, 2), default=Decimal("1.00"), nullable=False)
    acquisition_status: Mapped[str] = mapped_column(String(30), default="PROPOSED", nullable=False, index=True)
    geojson_polygon: Mapped[Any] = mapped_column(JSONB, nullable=False)
    geometry: Mapped[Optional[Any]] = mapped_column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)
    centroid_latitude: Mapped[Decimal] = mapped_column(Numeric(10, 7), nullable=False)
    centroid_longitude: Mapped[Decimal] = mapped_column(Numeric(10, 7), nullable=False)
    is_disputed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="parcels")
    village: Mapped["Village"] = relationship("Village", back_populates="parcels")
    ownerships: Mapped[List["ParcelOwnership"]] = relationship("ParcelOwnership", back_populates="parcel", cascade="all, delete-orphan")
    field_verifications: Mapped[List["FieldVerification"]] = relationship("FieldVerification", back_populates="parcel", cascade="all, delete-orphan")
    compensation: Mapped[Optional["CompensationAssessment"]] = relationship("CompensationAssessment", back_populates="parcel", uselist=False, cascade="all, delete-orphan")
    disbursements: Mapped[List["Disbursement"]] = relationship("Disbursement", back_populates="parcel")
    possession: Mapped[Optional["Possession"]] = relationship("Possession", back_populates="parcel", uselist=False)
    objections: Mapped[List["ObjectionsClaims"]] = relationship("ObjectionsClaims", back_populates="parcel")

    def __repr__(self) -> str:
        return f"<LandParcel(khasra='{self.khasra_number}', area_sqm={self.acquired_area_sqm}, status='{self.acquisition_status}')>"


class LandOwner(Base):
    __tablename__ = "land_owners"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    relative_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    aadhaar_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    pan_number: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    bank_account_no: Mapped[str] = mapped_column(String(30), nullable=False)
    bank_ifsc_code: Mapped[str] = mapped_column(String(11), nullable=False)
    bank_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(15), nullable=False)
    social_category: Mapped[str] = mapped_column(String(20), default="GEN", nullable=False)
    is_kyc_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    parcel_ownerships: Mapped[List["ParcelOwnership"]] = relationship("ParcelOwnership", back_populates="owner", cascade="all, delete-orphan")
    disbursements: Mapped[List["Disbursement"]] = relationship("Disbursement", back_populates="owner")
    objections: Mapped[List["ObjectionsClaims"]] = relationship("ObjectionsClaims", back_populates="owner")

    def __repr__(self) -> str:
        return f"<LandOwner(name='{self.full_name}', kyc_verified={self.is_kyc_verified})>"


class ParcelOwnership(Base):
    __tablename__ = "parcel_ownerships"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parcel_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("land_parcels.id", ondelete="CASCADE"), nullable=False, index=True)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("land_owners.id", ondelete="CASCADE"), nullable=False, index=True)
    ownership_share_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("100.00"), nullable=False)
    extent_area_sqm: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    mutation_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_primary_contact: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    parcel: Mapped["LandParcel"] = relationship("LandParcel", back_populates="ownerships")
    owner: Mapped["LandOwner"] = relationship("LandOwner", back_populates="parcel_ownerships")


class FieldVerification(Base):
    __tablename__ = "field_verifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parcel_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("land_parcels.id", ondelete="CASCADE"), nullable=False, index=True)
    verified_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    verification_date: Mapped[date] = mapped_column(Date, nullable=False)
    ground_survey_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    trees_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    structures_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    wells_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    verification_status: Mapped[str] = mapped_column(String(20), default="VERIFIED", nullable=False)

    # Relationships
    parcel: Mapped["LandParcel"] = relationship("LandParcel", back_populates="field_verifications")
    verified_by: Mapped["User"] = relationship("User", foreign_keys=[verified_by_user_id])
