from fastapi import APIRouter
from app.api.v1.endpoints import health, auth

api_router = APIRouter()

# Core system routes
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & RBAC"])
# api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
# api_router.include_router(workflow.router, prefix="/workflow", tags=["Workflow"])
# api_router.include_router(parcels.router, prefix="/parcels", tags=["Parcels"])
# api_router.include_router(compensation.router, prefix="/compensation", tags=["Compensation"])
# api_router.include_router(awards.router, prefix="/awards", tags=["Awards"])
# api_router.include_router(disbursements.router, prefix="/disbursements", tags=["Disbursements"])
# api_router.include_router(possession.router, prefix="/possession", tags=["Possession"])
# api_router.include_router(randr.router, prefix="/randr", tags=["R&R"])
# api_router.include_router(gis.router, prefix="/gis", tags=["GIS"])
