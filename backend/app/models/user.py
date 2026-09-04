import uuid
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.role import Role
    from app.models.location import State, District
    from app.models.project import Project, WorkflowTask
    from app.models.document import Document
    from app.models.audit import AuditLog


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role_id: Mapped[str] = mapped_column(String(36), ForeignKey("roles.id"), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    designation: Mapped[str] = mapped_column(String(100), nullable=False)
    organization: Mapped[str] = mapped_column(String(100), nullable=False)
    state_id: Mapped[Optional[str]] = mapped_column(String(10), ForeignKey("states.id"), nullable=True, index=True)
    district_id: Mapped[Optional[str]] = mapped_column(String(10), ForeignKey("districts.id"), nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    role: Mapped["Role"] = relationship("Role", back_populates="users")
    state: Mapped[Optional["State"]] = relationship("State", back_populates="users")
    district: Mapped[Optional["District"]] = relationship("District", back_populates="users")
    created_projects: Mapped[List["Project"]] = relationship("Project", back_populates="created_by")
    assigned_tasks: Mapped[List["WorkflowTask"]] = relationship("WorkflowTask", back_populates="assigned_user")
    uploaded_documents: Mapped[List["Document"]] = relationship("Document", back_populates="uploaded_by")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="user")

    def __repr__(self) -> str:
        return f"<User(id='{self.id}', username='{self.username}', role='{self.role_id}')>"
