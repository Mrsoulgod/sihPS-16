import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Numeric, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.award import Award
    from app.models.parcel import LandParcel, LandOwner
    from app.models.user import User


class Disbursement(Base):
    __tablename__ = "disbursements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    award_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("awards.id", ondelete="RESTRICT"), nullable=False, index=True)
    parcel_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("land_parcels.id", ondelete="RESTRICT"), nullable=False, index=True)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("land_owners.id", ondelete="RESTRICT"), nullable=False, index=True)
    disbursement_reference: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True, index=True)
    amount_inr: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), default="PFMS_DBT", nullable=False)
    pfms_batch_reference: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    payment_status: Mapped[str] = mapped_column(String(30), default="PENDING", nullable=False, index=True)
    bank_utr_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    disbursed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    failure_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    processed_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    award: Mapped["Award"] = relationship("Award", back_populates="disbursements")
    parcel: Mapped["LandParcel"] = relationship("LandParcel", back_populates="disbursements")
    owner: Mapped["LandOwner"] = relationship("LandOwner", back_populates="disbursements")
    processed_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[processed_by_user_id])

    def __repr__(self) -> str:
        return f"<Disbursement(batch='{self.pfms_batch_reference}', amount_inr={self.amount_inr}, status='{self.payment_status}')>"
