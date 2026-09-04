import uuid
from datetime import date
from decimal import Decimal
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Numeric, Integer, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.user import User
    from app.models.disbursement import Disbursement


class Award(Base):
    __tablename__ = "awards"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False, index=True)
    award_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    award_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_parcels_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_area_acres: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=Decimal("0.0"), nullable=False)
    total_award_amount_inr: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0.0"), nullable=False)
    cala_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    digital_sign_hash: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="DECLARED", nullable=False, index=True)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="awards")
    cala_user: Mapped["User"] = relationship("User", foreign_keys=[cala_user_id])
    disbursements: Mapped[List["Disbursement"]] = relationship("Disbursement", back_populates="award", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Award(number='{self.award_number}', total_inr={self.total_award_amount_inr}, status='{self.status}')>"
