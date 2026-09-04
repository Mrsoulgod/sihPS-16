import time
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db

router = APIRouter()
START_TIME = time.time()


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Health check endpoint verifying application uptime and database connectivity.
    """
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"disconnected: {str(e)}"

    now_iso = datetime.now(timezone.utc).isoformat()
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "project_name": settings.PROJECT_NAME,
            "environment": settings.ENVIRONMENT,
            "version": "1.0.0",
            "database_status": db_status,
            "uptime_seconds": round(time.time() - START_TIME, 2),
            "timestamp": now_iso,
        },
        "message": f"{settings.PROJECT_NAME} backend is running smoothly.",
        "metadata": {
            "timestamp": now_iso,
            "request_id": f"req-{uuid.uuid4().hex[:8]}",
        },
    }
