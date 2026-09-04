import logging
from datetime import datetime, timezone
from typing import AsyncGenerator
from sqlalchemy import DateTime
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.core.config import settings

logger = logging.getLogger(__name__)

# Enforce PostgreSQL + PostGIS as the canonical database
if not (settings.DATABASE_URL.startswith("postgresql://") or settings.DATABASE_URL.startswith("postgresql+asyncpg://")):
    raise ValueError(
        f"Invalid database configuration: '{settings.DATABASE_URL}'. "
        "The canonical database must be PostgreSQL + PostGIS (e.g. postgresql+asyncpg://...). "
        "SQLite is not permitted in NLAMS."
    )

# PostgreSQL async connection pool configuration
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy ORM models.
    Provides standard timestamp tracking for auditability.
    """
    __abstract__ = True

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency injection for FastAPI route handlers.
    Yields an active database session and ensures proper closure.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
