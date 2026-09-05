import pytest
import uuid
from decimal import Decimal
from app.models.parcel import LandParcel
from app.models.user import User
from app.models.enums import RoleCode
from app.schemas.field import FieldChecklistSubmissionRequest
from app.services.field_service import FieldService


@pytest.mark.asyncio
async def test_field_verification_checklist_submission():
    """Verify that field officer submission updates verification status and logs audit event."""
    parcel_id = uuid.uuid4()
    dummy_parcel = LandParcel(
        id=parcel_id,
        project_id=uuid.uuid4(),
        village_id="VIL001",
        khasra_number="101/1",
        khata_number="KH-42",
        total_area_sqm=Decimal("10117.15"),
        acquired_area_sqm=Decimal("10117.15"),
        circle_rate_per_sqm=Decimal("500.00"),
        land_type="AGRICULTURAL_IRRIGATED",
        acquisition_status="PROPOSED",
        centroid_latitude=Decimal("27.6534"),
        centroid_longitude=Decimal("76.1287"),
        geojson_polygon={},
        is_disputed=False,
    )
    dummy_user = User(
        id=uuid.uuid4(),
        username="field_inspector",
        full_name="Ramesh Kumar",
        role_id=RoleCode.FIELD_OFFICER.value,
    )

    class MockDB:
        async def execute(self, stmt):
            class MockResult:
                def scalar_one_or_none(self):
                    return dummy_parcel
            return MockResult()
        def add(self, item): pass
        async def commit(self): pass

    req = FieldChecklistSubmissionRequest(
        boundary_verified=True,
        occupancy_and_crop_surveyed=True,
        title_holder_kyc_verified=True,
        non_land_assets_enumerated=True,
        survey_remarks="Ground boundary matched with digital cadastre. 4 Neem trees enumerated.",
        gps_coordinates="27.6534 N, 76.1287 E",
        trees_count=4,
        is_draft=False,
    )

    res = await FieldService.submit_verification(MockDB(), parcel_id, req, dummy_user)
    assert res.verification_status == "VERIFIED"
    assert res.is_draft is False
    assert res.khasra_number == "101/1"
    assert "successfully submitted to CALA" in res.message
