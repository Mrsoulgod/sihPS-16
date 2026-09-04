import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.role import Role


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True, index=True)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # INFO, WARNING, CRITICAL
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    target_role: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("roles.id", ondelete="SET NULL"), nullable=True, index=True)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    project: Mapped[Optional["Project"]] = relationship("Project", back_populates="alerts")
    role: Mapped[Optional["Role"]] = relationship("Role")

    def __repr__(self) -> str:
        return f"<Alert(title='{self.title}', severity='{self.severity}', resolved={self.is_resolved})>"
