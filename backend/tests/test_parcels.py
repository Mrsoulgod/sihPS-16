import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings


async def get_token_for(client: AsyncClient, email: str) -> str:
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": email, "password": settings.DEMO_USER_PASSWORD},
    )
    assert res.status_code == 200, f"Failed login for {email}: {res.text}"
    return res.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_list_parcels():
    """Verify cadastral land parcel directory querying with pagination."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "district@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}

        res = await client.get("/api/v1/parcels", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "items" in data
        assert "total_records" in data
        assert data["total_records"] >= 12
        assert len(data["items"]) >= 12

        first_parcel = data["items"][0]
        assert "khasra_number" in first_parcel
        assert "acquired_area_acres" in first_parcel
        assert "acquisition_status" in first_parcel


@pytest.mark.asyncio
async def test_parcel_detail_pii_masking():
    """Verify parcel 360° detail protects sensitive owner Aadhaar and bank details."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "central@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}

        list_res = await client.get("/api/v1/parcels", headers=headers)
        assert list_res.status_code == 200
        parcel_id = list_res.json()["items"][0]["id"]

        detail_res = await client.get(f"/api/v1/parcels/{parcel_id}", headers=headers)
        assert detail_res.status_code == 200
        detail = detail_res.json()

        assert detail["khasra_number"] is not None
        assert "owners" in detail
        if detail["owners"]:
            owner = detail["owners"][0]
            # Verify Aadhaar is masked e.g. "XXXX-XXXX-..."
            assert owner["masked_aadhaar"].startswith("XXXX-XXXX-")
            # Verify bank account is masked e.g. "XXXXXX..."
            assert owner["masked_bank_account"].startswith("XXXXXX")


@pytest.mark.asyncio
async def test_field_verification_submission():
    """Verify authorized Field Officer can submit ground survey verification."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        field_token = await get_token_for(client, "field@gov.demo")
        headers = {"Authorization": f"Bearer {field_token}"}

        list_res = await client.get("/api/v1/parcels", headers=headers)
        assert list_res.status_code == 200
        parcel_id = list_res.json()["items"][0]["id"]

        verify_res = await client.post(
            f"/api/v1/parcels/{parcel_id}/verify",
            headers=headers,
            json={
                "ground_survey_notes": "Ground truthing completed during automated testing.",
                "trees_count": 12,
                "structures_count": 2,
                "wells_count": 1,
                "verification_status": "VERIFIED",
            },
        )
        assert verify_res.status_code == 200
        v_data = verify_res.json()
        assert v_data["trees_count"] == 12
        assert v_data["verification_status"] == "VERIFIED"


@pytest.mark.asyncio
async def test_gis_project_parcels_geojson():
    """Verify GeoJSON FeatureCollection retrieval with PostGIS polygons and status colors."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "district@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}

        # Get project
        proj_res = await client.get("/api/v1/projects", headers=headers)
        assert proj_res.status_code == 200
        project_id = proj_res.json()[0]["id"]

        gis_res = await client.get(f"/api/v1/gis/projects/{project_id}/parcels", headers=headers)
        assert gis_res.status_code == 200
        geojson = gis_res.json()

        assert geojson["type"] == "FeatureCollection"
        assert len(geojson["features"]) >= 12

        feature = geojson["features"][0]
        assert feature["type"] == "Feature"
        assert feature["geometry"]["type"] == "Polygon"
        assert "fillColor" in feature["properties"]
        assert "khasra_number" in feature["properties"]
        assert "metadata" in geojson
        assert "center" in geojson["metadata"]
        assert "bounds" in geojson["metadata"]
