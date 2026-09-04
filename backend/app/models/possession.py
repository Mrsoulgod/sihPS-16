import uuid
from datetime import date
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.parcel import LandParcel
    from app.models.user import User
    from app.models.document import Document


class Possession(Base):
    __tablename__ = "possessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False, index=True)
    parcel_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("land_parcels.id", ondelete="RESTRICT"), unique=True, nullable=False, index=True)
    possession_date: Mapped[date] = mapped_column(Date, nullable=False)
    possession_type: Mapped[str] = mapped_column(String(30), default="REGULAR_POST_DISBURSEMENT", nullable=False)
    is_encumbrance_free: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    possession_certificate_doc_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    taken_by_agency_officer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    handed_over_by_cala_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="possessions")
    parcel: Mapped["LandParcel"] = relationship("LandParcel", back_populates="possession")
    taken_by: Mapped["User"] = relationship("User", foreign_keys=[taken_by_agency_officer_id])
    handed_over_by: Mapped["User"] = relationship("User", foreign_keys=[handed_over_by_cala_id])
    possession_certificate: Mapped[Optional["Document"]] = relationship("Document", foreign_keys=[possession_certificate_doc_id])

    def __repr__(self) -> str:
        return f"<Possession(parcel_id='{self.parcel_id}', date='{self.possession_date}')>"
