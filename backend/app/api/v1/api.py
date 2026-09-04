from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    dashboard,
    projects,
    workflow,
    parcels,
    gis,
    notifications,
)

api_router = APIRouter()

# Core system routes
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & RBAC"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(workflow.router, prefix="/workflow", tags=["Acquisition Workflow"])
api_router.include_router(parcels.router, prefix="/parcels", tags=["Cadastral Parcels"])
api_router.include_router(gis.router, prefix="/gis", tags=["GIS Services"])
api_router.include_router(notifications.router, prefix="/alerts", tags=["Statutory Alerts & Notifications"])

