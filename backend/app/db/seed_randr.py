import asyncio
import uuid
from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy import select, delete, text
from app.core.database import AsyncSessionLocal
from app.models.enums import RoleCode
from app.models.project import Project, WorkflowTask
from app.models.randr import RAndRScheme, AffectedFamily, RAndRAllotment
from app.models.parcel import LandParcel, LandOwner
from app.models.alert import Alert
from app.models.audit import AuditLog
from app.models.user import User


async def seed_randr():
    async with AsyncSessionLocal() as session:
        print("Seeding Phase 6 R&R Benchmark Dataset...")

        # 1. Fetch benchmark project
        proj_res = await session.execute(
            select(Project).where(Project.project_code == "PRJ-NH48-PKG4")
        )
        project = proj_res.scalar_one_or_none()
        if not project:
            print("Project PRJ-NH48-PKG4 not found. Please ensure core database is initialized.")
            return

        # Fetch admin user for creator/approver
        user_res = await session.execute(
            select(User).where(User.username == "cala_jaipur")
        )
        cala_user = user_res.scalar_one_or_none()
        if not cala_user:
            admin_res = await session.execute(select(User).limit(1))
            cala_user = admin_res.scalar_one()

        from sqlalchemy.orm import selectinload

        # Fetch parcels
        parcels_res = await session.execute(
            select(LandParcel)
            .where(LandParcel.project_id == project.id)
            .options(selectinload(LandParcel.ownerships))
            .order_by(LandParcel.khasra_number)
        )
        parcels = parcels_res.scalars().all()
        parcel_by_khasra = {p.khasra_number: p for p in parcels}

        # Clear existing R&R records for clean seed
        await session.execute(delete(RAndRAllotment))
        await session.execute(delete(AffectedFamily))
        await session.execute(delete(RAndRScheme).where(RAndRScheme.project_id == project.id))
        await session.flush()

        # 2. Seed 2 R&R Schemes
        scheme_1 = RAndRScheme(
            id=uuid.uuid4(),
            project_id=project.id,
            scheme_reference="RNR/2026/001",
            scheme_title="Kotputli-Behror Model Resettlement Colony",
            scheme_type="RESETTLEMENT_COLONY",
            resettlement_site_name="Kotputli Sector 4 Integrated Resettlement Enclave",
            total_plots_planned=280,
            total_plots_allotted=6,
            sanctioned_budget_cr=Decimal("45.00"),
            spent_budget_cr=Decimal("32.40"),
            status="ACTIVE",
            target_completion_date=date(2026, 12, 31),
            approval_date=date(2026, 1, 15),
            approved_by_user_id=cala_user.id,
            remarks="Sanctioned under Section 31 of RFCTLARR Act 2013 for Delhi–Jaipur Corridor affected titleholders and homestead-displaced families.",
        )

        scheme_2 = RAndRScheme(
            id=uuid.uuid4(),
            project_id=project.id,
            scheme_reference="RNR/2026/002",
            scheme_title="Shahpura Rural Composite Assistance & Skill Center",
            scheme_type="COMPOSITE_ASSISTANCE",
            resettlement_site_name="Shahpura Agri-Livelihood & Resettlement Center",
            total_plots_planned=100,
            total_plots_allotted=2,
            sanctioned_budget_cr=Decimal("18.00"),
            spent_budget_cr=Decimal("9.80"),
            status="ACTIVE",
            target_completion_date=date(2027, 3, 31),
            approval_date=date(2026, 2, 10),
            approved_by_user_id=cala_user.id,
            remarks="Focuses on non-titleholder agricultural labourers, artisans, and livelihood rehabilitation for Paota and Shahpura tehsil villages.",
        )

        session.add_all([scheme_1, scheme_2])
        await session.flush()

        # 3. Seed 18 Affected Families (Fictional references AF-0001 to AF-0018)
        # Helper to get parcel & owner ID
        def get_parcel(kh):
            return parcel_by_khasra.get(kh)

        families_data = [
            # Scheme 1: Kotputli Model Resettlement Colony
            {
                "ref": "AF-0001",
                "scheme": scheme_1,
                "khasra": "101/1",
                "name": "Family of Khasra 101/1 (Head: Sh. R. Meena - Fictional)",
                "village": "Manpura",
                "type": "PDF_DISPLACED_REQUIRING_RELOCATION",
                "category": "TITLEHOLDER_DISPLACED",
                "social": "ST",
                "members": 5,
                "contact": "+91 98XXX X4201",
                "plot_sqyd": Decimal("150.00"),
                "plot_no": "Plot A-12",
                "subsistence": Decimal("36000.00"),
                "transport": Decimal("50000.00"),
                "resettlement": Decimal("50000.00"),
                "disbursed": True,
                "eligibility_status": "APPROVED",
                "eligibility_cat": "HOMESTEAD_ENTITLED",
                "eligibility_basis": "Section 31 & Second Schedule (Para 1 & 2): Titleholder homestead fully acquired; eligible for 150 sq.yd resettlement plot and grants.",
                "rehab_status": "SETTLED",
            },
            {
                "ref": "AF-0002",
                "scheme": scheme_1,
                "khasra": "101/1",
                "name": "Family of Agricultural Worker (Head: Sh. G. Ram - Fictional)",
                "village": "Manpura",
                "type": "PAF_AFFECTED_ONLY",
                "category": "AGRICULTURAL_LABOURER",
                "social": "SC",
                "members": 4,
                "contact": "+91 98XXX X4202",
                "plot_sqyd": Decimal("0.00"),
                "plot_no": None,
                "subsistence": Decimal("36000.00"),
                "transport": Decimal("25000.00"),
                "resettlement": Decimal("25000.00"),
                "disbursed": True,
                "eligibility_status": "APPROVED",
                "eligibility_cat": "LIVELIHOOD_ASSISTANCE",
                "eligibility_basis": "Second Schedule Para 4: Continuous agricultural labourer on Khasra 101/1 for >3 years prior to notification.",
                "rehab_status": "SETTLED",
            },
            {
                "ref": "AF-0003",
                "scheme": scheme_1,
                "khasra": "101/2",
                "name": "Family of Khasra 101/2 (Head: Smt. K. Devi - Fictional)",
                "village": "Manpura",
                "type": "PDF_DISPLACED_REQUIRING_RELOCATION",
                "category": "TITLEHOLDER_DISPLACED",
                "social": "OBC",
                "members": 6,
                "contact": "+91 98XXX X4203",
                "plot_sqyd": Decimal("150.00"),
                "plot_no": "Plot A-14",
                "subsistence": Decimal("36000.00"),
                "transport": Decimal("50000.00"),
                "resettlement": Decimal("50000.00"),
                "disbursed": True,
                "eligibility_status": "APPROVED",
                "eligibility_cat": "HOMESTEAD_ENTITLED",
                "eligibility_basis": "Second Schedule Para 1: Residential dwelling displaced under Section 38 handover.",
                "rehab_status": "SETTLED",
            },
            {
                "ref": "AF-0004",
                "scheme": scheme_1,
                "khasra": "102",
                "name": "Family of Khasra 102 (Head: Sh. H. Gurjar - Fictional)",
                "village": "Manpura",
                "type": "PDF_DISPLACED_REQUIRING_RELOCATION",
                "category": "TITLEHOLDER_DISPLACED",
                "social": "OBC",
                "members": 5,
                "contact": "+91 98XXX X4204",
                "plot_sqyd": Decimal("120.00"),
                "plot_no": "Plot B-08",
                "subsistence": Decimal("36000.00"),
                "transport": Decimal("50000.00"),
                "resettlement": Decimal("50000.00"),
                "disbursed": True,
                "eligibility_status": "APPROVED",
                "eligibility_cat": "HOMESTEAD_ENTITLED",
                "eligibility_basis": "Cadastral field survey verified residential pakka house on acquired extent.",
                "rehab_status": "PLOT_ALLOTTED",
            },
            {
                "ref": "AF-0005",
                "scheme": scheme_1,
                "khasra": "102",
                "name": "Family of Dairy Operator (Head: Sh. B. Lal Gurjar - Fictional)",
                "village": "Manpura",
                "type": "PAF_AFFECTED_ONLY",
                "category": "LIVELIHOOD_AFFECTED",
                "social": "OBC",
                "members": 4,
                "contact": "+91 98XXX X4205",
                "plot_sqyd": Decimal("0.00"),
                "plot_no": None,
                "subsistence": Decimal("36000.00"),
                "transport": Decimal("25000.00"),
                "resettlement": Decimal("25000.00"),
                "disbursed": False,
                "eligibility_status": "APPROVED",
                "eligibility_cat": "LIVELIHOOD_ASSISTANCE",
                "eligibility_basis": "Cattle shed and dairy livelihood displaced on parcel corridor boundary.",
                "rehab_status": "PLOT_ALLOTTED",
            },
            {
                "ref": "AF-0006",
                "scheme": scheme_1,
                "khasra": "103/A",
                "name": "Family of Khasra 103/A (Head: Sh. J. Sharma - Fictional)",
                "village": "Manpura",
                "type": "PDF_DISPLACED_REQUIRING_RELOCATION",
                "category": "TITLEHOLDER_DISPLACED",
                "social": "GEN",
                "members": 4,
                "contact": "+91 98XXX X4206",
                "plot_sqyd": Decimal("150.00"),
                "plot_no": "Plot B-10",
                "subsistence": Decimal("36000.00"),
                "transport": Decimal("50000.00"),
                "resettlement": Decimal("50000.00"),
                "disbursed": True,
                "eligibility_status": "APPROVED",
                "eligibility_cat": "HOMESTEAD_ENTITLED",
                "eligibility_basis": "Residential homestead verified and compensation disbursed.",
                "rehab_status": "PLOT_ALLOTTED",
            },
            {
                "ref": "AF-0007",
                "scheme": scheme_1,
                "khasra": "104",
                "name": "Family of Caretaker (Head: Sh. P. Saini - Fictional)",
                "village": "Manpura",
                "type": "PAF_AFFECTED_ONLY",
                "category": "TENANT_DISPLACED",
                "social": "OBC",
                "members": 3,
                "contact": "+91 98XXX X4207",
                "plot_sqyd": Decimal("0.00"),
                "plot_no": None,
                "subsistence": Decimal("36000.00"),
                "transport": Decimal("25000.00"),
                "resettlement": Decimal("25000.00"),
                "disbursed": True,
                "eligibility_status": "APPROVED",
                "eligibility_cat": "LIVELIHOOD_ASSISTANCE",
                "eligibility_basis": "Second Schedule Para 5: Tenant caretaker on commercial logistics godown.",
                "rehab_status": "SETTLED",
            },
            {
                "ref": "AF-0008",
                "scheme": scheme_1,
                "khasra": "105/1",
                "name": "Family of Khasra 105/1 (Head: Sh. M. Yadav - Fictional)",
                "village": "Manpura",
                "type": "PDF_DISPLACED_REQUIRING_RELOCATION",
                "category": "TITLEHOLDER_DISPLACED",
                "social": "OBC",
                "members": 5,
                "contact": "+91 98XXX X4208",
                "plot_sqyd": Decimal("120.00"),
                "plot_no": None,
                "subsistence": Decimal("36000.00"),
                "transport": Decimal("50000.00"),
                "resettlement": Decimal("50000.00"),
                "disbursed": False,
                "eligibility_status": "APPROVED",
                "eligibility_cat": "HOMESTEAD_ENTITLED",
                "eligibility_basis": "Award passed under Section 23; homestead relocation verified in ground survey.",
                "rehab_status": "SCHEME_APPROVED",
            },
            {
                "ref": "AF-0009",
                "scheme": scheme_1,
                "khasra": "201",
                "name": "Family of Khasra 201 (Head: Sh. B. Saini - Fictional)",
                "village": "Paota",
                "type": "PDF_DISPLACED_REQUIRING_RELOCATION",
                "category": "TITLEHOLDER_DISPLACED",
                "social": "OBC",
                "members": 6,
                "contact": "+91 98XXX X4209",
                "plot_sqyd": Decimal("120.00"),
                "plot_no": None,
                "subsistence": Decimal("36000.00"),
                "transport": Decimal("50000.00"),
                "resettlement": Decimal("50000.00"),
                "disbursed": False,
                "eligibility_status": "APPROVED",
                "eligibility_cat": "HOMESTEAD_ENTITLED",
                "eligibility_basis": "Award declared; house structure included in valuation.",
                "rehab_status": "SCHEME_APPROVED",
            },
            {
                "ref": "AF-0010",
                "scheme": scheme_1,
                "khasra": "202/A",
                "name": "Family of Khasra 202/A (Head: Sh. S. Choudhary - Fictional)",
                "village": "Paota",
                "type": "PAF_AFFECTED_ONLY",
                "category": "TITLEHOLDER_DISPLACED",
                "social": "OBC",
                "members": 4,
                "contact": "+91 98XXX X4210",
                "plot_sqyd": Decimal("0.00"),
                "plot_no": None,
                "subsistence": Decimal("36000.00"),
                "transport": Decimal("25000.00"),
                "resettlement": Decimal("25000.00"),
                "disbursed": False,
                "eligibility_status": "APPROVED",
                "eligibility_cat": "SCHEDULE_II_BENEFICIARY",
                "eligibility_basis": "Agricultural land loss exceeding 75% of total holding.",
                "rehab_status": "SCHEME_APPROVED",
            },

            # Scheme 2: Shahpura Rural Composite Assistance
            {
                "ref": "AF-0011",
                "scheme": scheme_2,
                "khasra": "203",
                "name": "Family of Khasra 203 (Head: Smt. S. Agarwal - Fictional)",
                "village": "Paota",
                "type": "PAF_AFFECTED_ONLY",
                "category": "TITLEHOLDER_DISPLACED",
                "social": "GEN",
                "members": 3,
                "contact": "+91 98XXX X4211",
                "plot_sqyd": Decimal("0.00"),
                "plot_no": None,
                "subsistence": Decimal("0.00"),
                "transport": Decimal("0.00"),
                "resettlement": Decimal("0.00"),
                "disbursed": False,
                "eligibility_status": "UNDER_REVIEW",
                "eligibility_cat": None,
                "eligibility_basis": "Verification pending regarding non-residential status of parcel owner.",
                "rehab_status": "SURVEYED",
            },
            {
                "ref": "AF-0012",
                "scheme": scheme_2,
                "khasra": "204/1",
                "name": "Family of Disputed Parcel (Head: Sh. M. Singh - Fictional)",
                "village": "Paota",
                "type": "PAF_AFFECTED_ONLY",
                "category": "TITLEHOLDER_DISPLACED",
                "social": "GEN",
                "members": 4,
                "contact": "+91 98XXX X4212",
                "plot_sqyd": Decimal("0.00"),
                "plot_no": None,
                "subsistence": Decimal("0.00"),
                "transport": Decimal("0.00"),
                "resettlement": Decimal("0.00"),
                "disbursed": False,
                "eligibility_status": "DISPUTED",
                "eligibility_cat": None,
                "eligibility_basis": "Title dispute pending in civil court; R&R eligibility held in abeyance pending final ownership adjudication.",
                "rehab_status": "SURVEYED",
            },
            {
                "ref": "AF-0013",
                "scheme": scheme_2,
                "khasra": "205",
                "name": "Family of Khasra 205 (Head: Sh. G. Verma - Fictional)",
                "village": "Paota",
                "type": "PAF_AFFECTED_ONLY",
                "category": "TITLEHOLDER_DISPLACED",
                "social": "SC",
                "members": 5,
                "contact": "+91 98XXX X4213",
                "plot_sqyd": Decimal("0.00"),
                "plot_no": None,
                "subsistence": Decimal("36000.00"),
                "transport": Decimal("25000.00"),
                "resettlement": Decimal("25000.00"),
                "disbursed": False,
                "eligibility_status": "ELIGIBLE",
                "eligibility_cat": "SCHEDULE_II_BENEFICIARY",
                "eligibility_basis": "Section 11 notification published; preliminary survey confirms marginal farmer status.",
                "rehab_status": "SURVEYED",
            },
            {
                "ref": "AF-0014",
                "scheme": scheme_2,
                "khasra": "206",
                "name": "Family of Village Grazing Dependent (Head: Sh. K. Gurjar - Fictional)",
                "village": "Paota",
                "type": "PAF_AFFECTED_ONLY",
                "category": "COMMUNITY_RIGHTS",
                "social": "OBC",
                "members": 4,
                "contact": "+91 98XXX X4214",
                "plot_sqyd": Decimal("0.00"),
                "plot_no": None,
                "subsistence": Decimal("36000.00"),
                "transport": Decimal("0.00"),
                "resettlement": Decimal("25000.00"),
                "disbursed": False,
                "eligibility_status": "PENDING",
                "eligibility_cat": "COMMUNITY_RIGHTS",
                "eligibility_basis": "Customary right over common grazing land verified by Gram Sabha resolution.",
                "rehab_status": "SURVEYED",
            },
            {
                "ref": "AF-0015",
                "scheme": scheme_2,
                "khasra": "101/1",
                "name": "Family of Rural Artisan (Head: Sh. D. Kumhar - Fictional)",
                "village": "Manpura",
                "type": "PAF_AFFECTED_ONLY",
                "category": "LIVELIHOOD_AFFECTED",
                "social": "OBC",
                "members": 5,
                "contact": "+91 98XXX X4215",
                "plot_sqyd": Decimal("0.00"),
                "plot_no": None,
                "subsistence": Decimal("36000.00"),
                "transport": Decimal("25000.00"),
                "resettlement": Decimal("25000.00"),
                "disbursed": True,
                "eligibility_status": "APPROVED",
                "eligibility_cat": "LIVELIHOOD_ASSISTANCE",
                "eligibility_basis": "Village pottery workshop relocated from highway ROW.",
                "rehab_status": "SETTLED",
            },
            {
                "ref": "AF-0016",
                "scheme": scheme_2,
                "khasra": "102",
                "name": "Family of Tenant Sharecropper (Head: Sh. N. Sharma - Fictional)",
                "village": "Manpura",
                "type": "PAF_AFFECTED_ONLY",
                "category": "TENANT_DISPLACED",
                "social": "GEN",
                "members": 3,
                "contact": "+91 98XXX X4216",
                "plot_sqyd": Decimal("0.00"),
                "plot_no": None,
                "subsistence": Decimal("36000.00"),
                "transport": Decimal("25000.00"),
                "resettlement": Decimal("25000.00"),
                "disbursed": True,
                "eligibility_status": "APPROVED",
                "eligibility_cat": "LIVELIHOOD_ASSISTANCE",
                "eligibility_basis": "Sharecropper agreement on Khasra 102 verified by Tehsil revenue patwari.",
                "rehab_status": "SETTLED",
            },
            {
                "ref": "AF-0017",
                "scheme": scheme_2,
                "khasra": "205",
                "name": "Family of Handloom Weaver (Head: Smt. M. Bano - Fictional)",
                "village": "Paota",
                "type": "PAF_AFFECTED_ONLY",
                "category": "LIVELIHOOD_AFFECTED",
                "social": "OBC",
                "members": 4,
                "contact": "+91 98XXX X4217",
                "plot_sqyd": Decimal("0.00"),
                "plot_no": "Unit C-04",
                "subsistence": Decimal("36000.00"),
                "transport": Decimal("25000.00"),
                "resettlement": Decimal("25000.00"),
                "disbursed": True,
                "eligibility_status": "APPROVED",
                "eligibility_cat": "LIVELIHOOD_ASSISTANCE",
                "eligibility_basis": "Handloom work shed provided in Shahpura Skill Center.",
                "rehab_status": "SETTLED",
            },
            {
                "ref": "AF-0018",
                "scheme": scheme_2,
                "khasra": "104",
                "name": "Family of Commercial Entity Director (Non-Resident - Fictional)",
                "village": "Manpura",
                "type": "PAF_AFFECTED_ONLY",
                "category": "TITLEHOLDER_DISPLACED",
                "social": "GEN",
                "members": 2,
                "contact": "+91 98XXX X4218",
                "plot_sqyd": Decimal("0.00"),
                "plot_no": None,
                "subsistence": Decimal("0.00"),
                "transport": Decimal("0.00"),
                "resettlement": Decimal("0.00"),
                "disbursed": False,
                "eligibility_status": "INELIGIBLE",
                "eligibility_cat": None,
                "eligibility_basis": "Corporate commercial entity; not entitled to residential resettlement plots or subsistence grants under Section 31.",
                "rehab_status": "SURVEYED",
            },
        ]

        created_families = []
        for d in families_data:
            pcl = get_parcel(d["khasra"])
            owner_id = pcl.ownerships[0].owner_id if pcl and pcl.ownerships else None

            fam = AffectedFamily(
                id=uuid.uuid4(),
                scheme_id=d["scheme"].id,
                family_reference_id=d["ref"],
                parcel_id=pcl.id if pcl else None,
                land_owner_id=owner_id,
                head_of_family_name=d["name"],
                village_name=d["village"],
                family_type=d["type"],
                displacement_category=d["category"],
                social_category=d["social"],
                family_members_count=d["members"],
                contact_masked=d["contact"],
                entitled_plot_sqyd=d["plot_sqyd"],
                allotted_plot_number=d["plot_no"],
                subsistence_grant_inr=d["subsistence"],
                transportation_allowance_inr=d["transport"],
                one_time_resettlement_allowance_inr=d["resettlement"],
                is_grant_disbursed=d["disbursed"],
                eligibility_status=d["eligibility_status"],
                eligibility_category=d["eligibility_cat"],
                eligibility_assessment_date=date(2026, 2, 1),
                assessing_authority="Competent Authority for Land Acquisition (CALA)",
                eligibility_basis=d["eligibility_basis"],
                eligibility_remarks="Verified in joint verification camp with Panchayati Raj representatives.",
                rehabilitation_status=d["rehab_status"],
            )
            session.add(fam)
            created_families.append(fam)

        await session.flush()

        # 4. Seed Allotments (24 allotments for plots, subsistence, transportation, training)
        allotments_data = [
            # AF-0001
            {"fam": created_families[0], "scheme": scheme_1, "ref": "ALLOT/2026/001", "cat": "HOUSING_RESETTLEMENT", "type": "PLOT", "asset": "Plot A-12, Sector 4 Enclave", "order": "CALA/RR/2026/ORD-101", "val": Decimal("1500000.00"), "status": "COMPLETED"},
            {"fam": created_families[0], "scheme": scheme_1, "ref": "ALLOT/2026/002", "cat": "SUBSISTENCE_ASSISTANCE", "type": "SUBSISTENCE_ALLOWANCE", "asset": "PFMS Grant Batch SB-01", "order": "CALA/RR/2026/ORD-102", "val": Decimal("36000.00"), "status": "COMPLETED"},
            {"fam": created_families[0], "scheme": scheme_1, "ref": "ALLOT/2026/003", "cat": "SUBSISTENCE_ASSISTANCE", "type": "TRANSPORT_ALLOWANCE", "asset": "Direct Credit TR-01", "order": "CALA/RR/2026/ORD-103", "val": Decimal("50000.00"), "status": "COMPLETED"},

            # AF-0002
            {"fam": created_families[1], "scheme": scheme_1, "ref": "ALLOT/2026/004", "cat": "SUBSISTENCE_ASSISTANCE", "type": "SUBSISTENCE_ALLOWANCE", "asset": "PFMS Grant Batch SB-01", "order": "CALA/RR/2026/ORD-104", "val": Decimal("36000.00"), "status": "COMPLETED"},
            {"fam": created_families[1], "scheme": scheme_1, "ref": "ALLOT/2026/005", "cat": "EMPLOYMENT_LIVELIHOOD", "type": "LIVELIHOOD_GRANT", "asset": "Agri-equipment kit", "order": "CALA/RR/2026/ORD-105", "val": Decimal("25000.00"), "status": "COMPLETED"},

            # AF-0003
            {"fam": created_families[2], "scheme": scheme_1, "ref": "ALLOT/2026/006", "cat": "HOUSING_RESETTLEMENT", "type": "PLOT", "asset": "Plot A-14, Sector 4 Enclave", "order": "CALA/RR/2026/ORD-106", "val": Decimal("1500000.00"), "status": "COMPLETED"},
            {"fam": created_families[2], "scheme": scheme_1, "ref": "ALLOT/2026/007", "cat": "SUBSISTENCE_ASSISTANCE", "type": "SUBSISTENCE_ALLOWANCE", "asset": "PFMS Grant Batch SB-01", "order": "CALA/RR/2026/ORD-107", "val": Decimal("36000.00"), "status": "COMPLETED"},
            {"fam": created_families[2], "scheme": scheme_1, "ref": "ALLOT/2026/008", "cat": "SUBSISTENCE_ASSISTANCE", "type": "TRANSPORT_ALLOWANCE", "asset": "Direct Credit TR-02", "order": "CALA/RR/2026/ORD-108", "val": Decimal("50000.00"), "status": "COMPLETED"},

            # AF-0004
            {"fam": created_families[3], "scheme": scheme_1, "ref": "ALLOT/2026/009", "cat": "HOUSING_RESETTLEMENT", "type": "PLOT", "asset": "Plot B-08, Sector 4 Enclave", "order": "CALA/RR/2026/ORD-109", "val": Decimal("1200000.00"), "status": "DELIVERED"},
            {"fam": created_families[3], "scheme": scheme_1, "ref": "ALLOT/2026/010", "cat": "SUBSISTENCE_ASSISTANCE", "type": "SUBSISTENCE_ALLOWANCE", "asset": "PFMS Grant Batch SB-02", "order": "CALA/RR/2026/ORD-110", "val": Decimal("36000.00"), "status": "COMPLETED"},

            # AF-0005
            {"fam": created_families[4], "scheme": scheme_1, "ref": "ALLOT/2026/011", "cat": "EMPLOYMENT_LIVELIHOOD", "type": "LIVELIHOOD_GRANT", "asset": "Dairy shed relocation allowance", "order": "CALA/RR/2026/ORD-111", "val": Decimal("50000.00"), "status": "ALLOCATED"},

            # AF-0006
            {"fam": created_families[5], "scheme": scheme_1, "ref": "ALLOT/2026/012", "cat": "HOUSING_RESETTLEMENT", "type": "PLOT", "asset": "Plot B-10, Sector 4 Enclave", "order": "CALA/RR/2026/ORD-112", "val": Decimal("1500000.00"), "status": "DELIVERED"},
            {"fam": created_families[5], "scheme": scheme_1, "ref": "ALLOT/2026/013", "cat": "SUBSISTENCE_ASSISTANCE", "type": "SUBSISTENCE_ALLOWANCE", "asset": "PFMS Grant Batch SB-02", "order": "CALA/RR/2026/ORD-113", "val": Decimal("36000.00"), "status": "COMPLETED"},

            # AF-0007
            {"fam": created_families[6], "scheme": scheme_1, "ref": "ALLOT/2026/014", "cat": "EMPLOYMENT_LIVELIHOOD", "type": "LIVELIHOOD_GRANT", "asset": "Resettlement transitional grant", "order": "CALA/RR/2026/ORD-114", "val": Decimal("50000.00"), "status": "COMPLETED"},

            # AF-0015
            {"fam": created_families[14], "scheme": scheme_2, "ref": "ALLOT/2026/015", "cat": "EMPLOYMENT_LIVELIHOOD", "type": "LIVELIHOOD_GRANT", "asset": "Pottery kiln workshop assistance", "order": "CALA/RR/2026/ORD-115", "val": Decimal("40000.00"), "status": "COMPLETED"},
            {"fam": created_families[14], "scheme": scheme_2, "ref": "ALLOT/2026/016", "cat": "SUBSISTENCE_ASSISTANCE", "type": "SUBSISTENCE_ALLOWANCE", "asset": "PFMS Grant Batch SB-03", "order": "CALA/RR/2026/ORD-116", "val": Decimal("36000.00"), "status": "COMPLETED"},

            # AF-0016
            {"fam": created_families[15], "scheme": scheme_2, "ref": "ALLOT/2026/017", "cat": "SUBSISTENCE_ASSISTANCE", "type": "SUBSISTENCE_ALLOWANCE", "asset": "PFMS Grant Batch SB-03", "order": "CALA/RR/2026/ORD-117", "val": Decimal("36000.00"), "status": "COMPLETED"},
            {"fam": created_families[15], "scheme": scheme_2, "ref": "ALLOT/2026/018", "cat": "EMPLOYMENT_LIVELIHOOD", "type": "LIVELIHOOD_GRANT", "asset": "Crop transition grant", "order": "CALA/RR/2026/ORD-118", "val": Decimal("25000.00"), "status": "COMPLETED"},

            # AF-0017
            {"fam": created_families[16], "scheme": scheme_2, "ref": "ALLOT/2026/019", "cat": "HOUSING_RESETTLEMENT", "type": "HOUSING_UNIT", "asset": "Unit C-04, Shahpura Center", "order": "CALA/RR/2026/ORD-119", "val": Decimal("800000.00"), "status": "COMPLETED"},
            {"fam": created_families[16], "scheme": scheme_2, "ref": "ALLOT/2026/020", "cat": "TRAINING_SUPPORT", "type": "TRAINING_GRANT", "asset": "Handloom weaving modern loom grant", "order": "CALA/RR/2026/ORD-120", "val": Decimal("30000.00"), "status": "COMPLETED"},
        ]

        for a in allotments_data:
            allotment = RAndRAllotment(
                id=uuid.uuid4(),
                family_id=a["fam"].id,
                scheme_id=a["scheme"].id,
                allotment_reference=a["ref"],
                entitlement_category=a["cat"],
                allotment_type=a["type"],
                asset_identifier=a["asset"],
                allotment_order_no=a["order"],
                allotment_date=date(2026, 2, 20),
                delivery_date=date(2026, 3, 1) if a["status"] in ("DELIVERED", "COMPLETED") else None,
                allocated_value_inr=a["val"],
                responsible_authority="CALA Land Acquisition Officer, Jaipur",
                status=a["status"],
                remarks="Allotment sanction order issued following biometric verification camp.",
            )
            session.add(allotment)

        # 5. Add R&R Alerts
        rr_alert_1 = Alert(
            project_id=project.id,
            severity="WARNING",
            category="STATUTORY_DEADLINE",
            title="R&R Schedule II Allotment Review Due: Kotputli Enclave",
            message="12 Project Affected Families in Manpura village pending physical possession handover of homestead plots in Sector 4 Enclave.",
            target_role=RoleCode.DISTRICT_OFFICER.value,
            is_resolved=False,
        )
        rr_alert_2 = Alert(
            project_id=project.id,
            severity="CRITICAL",
            category="LITIGATION_RISK",
            title="Disputed R&R Assessment: Khasra 204/1 Paota",
            message="Family AF-0012 title dispute in civil court. Eligibility assessment held in abeyance to avoid premature disbursement.",
            target_role=RoleCode.DISTRICT_OFFICER.value,
            is_resolved=False,
        )
        session.add_all([rr_alert_1, rr_alert_2])

        # 6. Add R&R Workflow Task
        rr_task = WorkflowTask(
            project_id=project.id,
            parcel_id=None,
            task_type="RR_SCHEME_MONITORING",
            title="Verify Physical Delivery of Homestead Plots (Kotputli Enclave)",
            description="Field Officer joint inspection required to confirm boundary demarcation of Plots A-12 to B-10 at Sector 4 Resettlement Enclave.",
            assigned_role=RoleCode.FIELD_OFFICER.value,
            status="PENDING",
            priority="HIGH",
            due_date=date(2026, 9, 30),
            action_url=f"/r-and-r/{scheme_1.id}",
        )
        session.add(rr_task)

        # 7. Add Audit Logs
        audit_1 = AuditLog(
            user_id=cala_user.id,
            action="SANCTION_RR_SCHEME",
            entity_name="RAndRScheme",
            entity_id=str(scheme_1.id),
            new_values={
                "scheme_reference": scheme_1.scheme_reference,
                "scheme_title": scheme_1.scheme_title,
                "sanctioned_budget_cr": str(scheme_1.sanctioned_budget_cr),
            },
        )
        audit_2 = AuditLog(
            user_id=cala_user.id,
            action="APPROVE_RR_ELIGIBILITY",
            entity_name="AffectedFamily",
            entity_id=str(created_families[0].id),
            new_values={
                "family_reference_id": created_families[0].family_reference_id,
                "eligibility_status": "APPROVED",
                "allotted_plot": "Plot A-12",
            },
        )
        session.add_all([audit_1, audit_2])

        await session.commit()
        print("Successfully seeded Phase 6 R&R Benchmark Dataset!")
        print(f"  Schemes created: 2")
        print(f"  Affected families created: {len(created_families)}")
        print(f"  Allotments created: {len(allotments_data)}")


if __name__ == "__main__":
    asyncio.run(seed_randr())
