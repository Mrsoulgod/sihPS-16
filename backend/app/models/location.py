from typing import List, Optional, TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import String, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.project import Project
    from app.models.parcel import LandParcel


class State(Base):
    __tablename__ = "states"

    id: Mapped[str] = mapped_column(String(10), primary_key=True)  # e.g. 'IN-RJ', 'IN-HR'
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(10), nullable=False)

    # Relationships
    districts: Mapped[List["District"]] = relationship("District", back_populates="state", cascade="all, delete-orphan")
    users: Mapped[List["User"]] = relationship("User", back_populates="state")

    def __repr__(self) -> str:
        return f"<State(id='{self.id}', name='{self.name}')>"


class District(Base):
    __tablename__ = "districts"

    id: Mapped[str] = mapped_column(String(10), primary_key=True)  # e.g. 'DST-JAI'
    state_id: Mapped[str] = mapped_column(String(10), ForeignKey("states.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    lgd_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Relationships
    state: Mapped["State"] = relationship("State", back_populates="districts")
    tehsils: Mapped[List["Tehsil"]] = relationship("Tehsil", back_populates="district", cascade="all, delete-orphan")
    users: Mapped[List["User"]] = relationship("User", back_populates="district")
    projects: Mapped[List["Project"]] = relationship("Project", back_populates="primary_district")

    def __repr__(self) -> str:
        return f"<District(id='{self.id}', name='{self.name}', state_id='{self.state_id}')>"


class Tehsil(Base):
    __tablename__ = "tehsils"

    id: Mapped[str] = mapped_column(String(20), primary_key=True)
    district_id: Mapped[str] = mapped_column(String(10), ForeignKey("districts.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    # Relationships
    district: Mapped["District"] = relationship("District", back_populates="tehsils")
    villages: Mapped[List["Village"]] = relationship("Village", back_populates="tehsil", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Tehsil(id='{self.id}', name='{self.name}')>"


class Village(Base):
    __tablename__ = "villages"

    id: Mapped[str] = mapped_column(String(20), primary_key=True)
    tehsil_id: Mapped[str] = mapped_column(String(20), ForeignKey("tehsils.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    census_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    circle_rate_rural_factor: Mapped[Decimal] = mapped_column(Numeric(4, 2), default=Decimal("1.00"), nullable=False)

    # Relationships
    tehsil: Mapped["Tehsil"] = relationship("Tehsil", back_populates="villages")
    parcels: Mapped[List["LandParcel"]] = relationship("LandParcel", back_populates="village")

    def __repr__(self) -> str:
        return f"<Village(id='{self.id}', name='{self.name}')>"
