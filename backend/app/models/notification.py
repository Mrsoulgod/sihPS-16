import uuid
from datetime import date
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Date, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.user import User
    from app.models.parcel import LandParcel, LandOwner
    from app.models.document import Document


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    section_type: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    gazette_notification_no: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    publication_date: Mapped[date] = mapped_column(Date, nullable=False)
    objection_deadline_date: Mapped[date] = mapped_column(Date, nullable=False)
    gazette_document_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    issued_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default="DRAFT", nullable=False)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="notifications")
    issued_by: Mapped["User"] = relationship("User", foreign_keys=[issued_by_user_id])
    gazette_document: Mapped[Optional["Document"]] = relationship("Document", foreign_keys=[gazette_document_id])
    objections: Mapped[List["ObjectionsClaims"]] = relationship("ObjectionsClaims", back_populates="notification", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Notification(section='{self.section_type}', gazette_no='{self.gazette_notification_no}')>"


class ObjectionsClaims(Base):
    __tablename__ = "objections_claims"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    notification_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notifications.id", ondelete="CASCADE"), nullable=False, index=True)
    parcel_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("land_parcels.id", ondelete="SET NULL"), nullable=True, index=True)
    owner_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("land_owners.id", ondelete="SET NULL"), nullable=True, index=True)
    objection_type: Mapped[str] = mapped_column(String(50), nullable=False)
    summary_text: Mapped[str] = mapped_column(Text, nullable=False)
    hearing_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    disposal_status: Mapped[str] = mapped_column(String(20), default="PENDING", nullable=False, index=True)
    cala_order_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_document_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    notification: Mapped["Notification"] = relationship("Notification", back_populates="objections")
    parcel: Mapped[Optional["LandParcel"]] = relationship("LandParcel", back_populates="objections")
    owner: Mapped[Optional["LandOwner"]] = relationship("LandOwner", back_populates="objections")
    order_document: Mapped[Optional["Document"]] = relationship("Document", foreign_keys=[order_document_id])

    def __repr__(self) -> str:
        return f"<ObjectionsClaims(id='{self.id}', type='{self.objection_type}', status='{self.disposal_status}')>"
