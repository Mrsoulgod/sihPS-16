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
    compensation,
    awards,
    disbursements,
    possession,
    randr,
    affected_families,
    analytics,
    risk,
    reports,
    integrations,
    documents,
    master_data,
    field,
    social,
    action_center,
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

# Phase 5: Compensation, Award, Disbursement, Possession routes
api_router.include_router(compensation.router, prefix="/compensation", tags=["Configurable Compensation Assessment"])
api_router.include_router(awards.router, prefix="/awards", tags=["Section 23/30 Awards"])
api_router.include_router(disbursements.router, prefix="/disbursements", tags=["Compensation Disbursement & PFMS"])
api_router.include_router(possession.router, prefix="/possession", tags=["Section 38 Possession"])

# Phase 6: Rehabilitation & Resettlement (R&R) + Affected Families routes
api_router.include_router(randr.router, prefix="/r-and-r", tags=["Rehabilitation & Resettlement"])
api_router.include_router(randr.router, prefix="/randr", tags=["Rehabilitation & Resettlement (Alias)"])
api_router.include_router(affected_families.router, prefix="/affected-families", tags=["Affected Families (PAFs/PDFs)"])

# Phase 7: Analytics, Predictive Risk Intelligence & MIS Reporting routes
api_router.include_router(analytics.router, prefix="/analytics", tags=["National & State Analytics"])
api_router.include_router(risk.router, prefix="/risk", tags=["Predictive Risk Intelligence"])
api_router.include_router(risk.router, prefix="/analytics/risk", tags=["Predictive Risk Intelligence (Alias)"])
api_router.include_router(reports.router, prefix="/reports", tags=["Statutory MIS Reports"])

# SIH Gap-Closure: Government Integrations, Document Versioning, Master Data, Field Mobile, Social & Action Centre
api_router.include_router(integrations.router, prefix="/integrations", tags=["Government Integration Gateway (Sandbox)"])
api_router.include_router(documents.router, prefix="/documents", tags=["Document Repository & Version Control"])
api_router.include_router(master_data.router, prefix="/master-data", tags=["Master Data & Taxonomy Standardization"])
api_router.include_router(field.router, prefix="/field", tags=["Field Officer Mobile Survey Workflow"])
api_router.include_router(social.router, prefix="/social", tags=["Social / R&R Officer Case Management"])
api_router.include_router(action_center.router, prefix="/action-centre", tags=["Action Centre & Work Execution"])
api_router.include_router(action_center.router, prefix="/actions", tags=["Action Centre (Alias)"])




