from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    users: Mapped[List["User"]] = relationship("User", back_populates="role")

    def __repr__(self) -> str:
        return f"<Role(id='{self.id}', name='{self.name}')>"
