from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.location import State, District, Tehsil, Village
from app.models.enums import (
    RoleCode,
    ProjectStageCode,
    LandType,
    AcquisitionStatus,
    SocialCategory,
    NotificationSection,
    AwardStatus,
    DisbursementStatus,
    PossessionStatus,
    RehabStatus,
    AlertSeverity,
)
from app.schemas.master_data import (
    MasterTaxonomyCategory,
    StatutoryParametersMaster,
    MasterGeographicItem,
)


class MasterDataService:
    """
    Standardized Master Data & Taxonomy Service.
    Enforces uniform data standards and statutory definitions nationwide.
    """

    @classmethod
    async def get_geographic_hierarchy(cls, db: AsyncSession) -> List[MasterGeographicItem]:
        """Fetch all states, districts, tehsils, and villages in a standardized flat structure."""
        items: List[MasterGeographicItem] = []

        # States
        states_stmt = select(State).order_by(State.name)
        states = (await db.execute(states_stmt)).scalars().all()
        for s in states:
            items.append(MasterGeographicItem(
                id=s.id,
                name=s.name,
                code=s.code,
                level="STATE",
                parent_id=None,
                lgd_code=None,
            ))

        # Districts
        districts_stmt = select(District).order_by(District.name)
        districts = (await db.execute(districts_stmt)).scalars().all()
        for d in districts:
            items.append(MasterGeographicItem(
                id=d.id,
                name=d.name,
                code=None,
                level="DISTRICT",
                parent_id=d.state_id,
                lgd_code=d.lgd_code,
            ))

        # Tehsils
        tehsils_stmt = select(Tehsil).order_by(Tehsil.name)
        tehsils = (await db.execute(tehsils_stmt)).scalars().all()
        for t in tehsils:
            items.append(MasterGeographicItem(
                id=t.id,
                name=t.name,
                code=None,
                level="TEHSIL",
                parent_id=t.district_id,
                lgd_code=None,
            ))

        # Villages
        villages_stmt = select(Village).order_by(Village.name)
        villages = (await db.execute(villages_stmt)).scalars().all()
        for v in villages:
            items.append(MasterGeographicItem(
                id=v.id,
                name=v.name,
                code=v.census_code,
                level="VILLAGE",
                parent_id=v.tehsil_id,
                lgd_code=v.census_code,
                rural_factor=float(v.circle_rate_rural_factor) if v.circle_rate_rural_factor else 1.0,
            ))

        return items

    @classmethod
    def get_standardized_taxonomy(cls) -> List[MasterTaxonomyCategory]:
        """Return standardized taxonomy categories across all operational modules."""
        return [
            MasterTaxonomyCategory(
                category_id="CAT-ROLES",
                category_name="System Roles & Governance Hierarchy",
                description="Statutory role taxonomy defining permission boundaries and jurisdiction limits.",
                values=[
                    {"code": RoleCode.CENTRAL_OFFICER.value, "label": "Central Ministry Officer", "scope": "National"},
                    {"code": RoleCode.STATE_OFFICER.value, "label": "State Government Officer", "scope": "State"},
                    {"code": RoleCode.DISTRICT_OFFICER.value, "label": "District CALA / Collector", "scope": "District"},
                    {"code": RoleCode.PROJECT_AGENCY.value, "label": "Project Implementing Agency (NHAI/Railways)", "scope": "Assigned Project"},
                    {"code": RoleCode.FIELD_OFFICER.value, "label": "Field Surveyor & Verification Inspector", "scope": "Assigned District / Tehsil"},
                    {"code": RoleCode.ADMIN.value, "label": "System Administrator", "scope": "System Wide"},
                ],
            ),
            MasterTaxonomyCategory(
                category_id="CAT-STAGES",
                category_name="RFCTLARR Acquisition Lifecycle Stages",
                description="Codified statutory stages adhering to RFCTLARR 2013 milestone sequencing.",
                values=[
                    {"code": "PRELIMINARY_SURVEY", "label": "Preliminary Project Proposal & Survey", "statutory_ref": "Section 4 / 6"},
                    {"code": "SIA_ASSESSMENT", "label": "Social Impact Assessment (SIA)", "statutory_ref": "Section 7 / 8"},
                    {"code": "SECTION_11_NOTIFICATION", "label": "Section 11 Preliminary Notification", "statutory_ref": "Section 11(1)"},
                    {"code": "SECTION_15_HEARING", "label": "Section 15 Objection Hearings", "statutory_ref": "Section 15(2)"},
                    {"code": "SECTION_19_DECLARATION", "label": "Section 19 Declaration of Acquisition", "statutory_ref": "Section 19(1)"},
                    {"code": "COMPENSATION_ASSESSMENT", "label": "Section 26-30 Compensation Determination", "statutory_ref": "Section 26-30"},
                    {"code": "AWARDS_DECLARED", "label": "Section 23/30 Statutory Award Declaration", "statutory_ref": "Section 23"},
                    {"code": "COMPENSATION_DISBURSED", "label": "PFMS Direct Benefit Transfer (DBT)", "statutory_ref": "Section 38 / 77"},
                    {"code": "POSSESSION_COMPLETED", "label": "Section 38 Physical Land Handover", "statutory_ref": "Section 38(1)"},
                    {"code": "RANDR_COMPLETION", "label": "Rehabilitation & Resettlement Settlement", "statutory_ref": "Section 31 / 2nd Schedule"},
                ],
            ),
            MasterTaxonomyCategory(
                category_id="CAT-LAND-PARCELS",
                category_name="Land Parcel Types & Verification Statuses",
                description="Standardized land classification and ground truth verification states.",
                values=[
                    {"code": LandType.AGRICULTURAL_IRRIGATED.value, "label": "Agricultural (Irrigated)", "type": "LAND_TYPE"},
                    {"code": LandType.AGRICULTURAL_UNIRRIGATED.value, "label": "Agricultural (Unirrigated)", "type": "LAND_TYPE"},
                    {"code": LandType.RESIDENTIAL.value, "label": "Residential", "type": "LAND_TYPE"},
                    {"code": LandType.COMMERCIAL.value, "label": "Commercial", "type": "LAND_TYPE"},
                    {"code": LandType.GOVERNMENT_WASTE.value, "label": "Government / Waste Land", "type": "LAND_TYPE"},
                    {"code": "PENDING", "label": "Pending Field Verification", "type": "VERIFICATION_STATUS"},
                    {"code": "VERIFIED", "label": "Field Verified & Validated", "type": "VERIFICATION_STATUS"},
                    {"code": "CLEAR", "label": "Clear Title / No Dispute", "type": "DISPUTE_STATUS"},
                    {"code": "DISPUTED", "label": "Disputed / Boundary Conflict", "type": "DISPUTE_STATUS"},
                ],
            ),
            MasterTaxonomyCategory(
                category_id="CAT-RANDR-ENTITLEMENTS",
                category_name="R&R Entitlements & Family Categorization",
                description="Statutory classifications under Second Schedule of RFCTLARR Act 2013.",
                values=[
                    {"code": "DISPLACED_TITLE_HOLDER", "label": "Displaced Title Holder", "category": "DISPLACEMENT"},
                    {"code": "SHARECROPPER", "label": "Sharecropper / Tenant Farmer", "category": "DISPLACEMENT"},
                    {"code": "LIVELIHOOD_AFFECTED", "label": "Livelihood Affected (Artisan / Landless Worker)", "category": "DISPLACEMENT"},
                    {"code": "PLOT", "label": "Constructed House / Resettlement Plot", "category": "ENTITLEMENT"},
                    {"code": "CASH_GRANT", "label": "One-Time Subsistence / Resettlement Cash Grant", "category": "ENTITLEMENT"},
                    {"code": "ANNUITY", "label": "Monthly Annuity / Pension Option", "category": "ENTITLEMENT"},
                    {"code": "TRAINING_SEAT", "label": "Vocational Skill Training Seat", "category": "ENTITLEMENT"},
                ],
            ),
        ]

    @classmethod
    def get_statutory_parameters(cls) -> StatutoryParametersMaster:
        """Return central statutory parameters governing valuation, SLAs, and risk weights."""
        return StatutoryParametersMaster()
