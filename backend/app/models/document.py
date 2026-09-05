import uuid
from typing import TYPE_CHECKING, Optional, List
from sqlalchemy import String, BigInteger, ForeignKey, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    document_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    sha256_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    uploaded_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    verification_status: Mapped[str] = mapped_column(String(20), default="PENDING", nullable=False, index=True)
    
    # Version Control
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    parent_document_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True, index=True)
    version_notes: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_current_version: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    uploaded_by: Mapped["User"] = relationship("User", back_populates="uploaded_documents")
    parent_document: Mapped[Optional["Document"]] = relationship("Document", remote_side=[id], backref="child_versions")

    def __repr__(self) -> str:
        return f"<Document(name='{self.file_name}', v={self.version}, type='{self.document_type}', status='{self.verification_status}')>"

