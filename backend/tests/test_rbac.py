import pytest
from fastapi import APIRouter, Depends
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings
from app.core.permissions import require_roles, check_jurisdiction
from app.models.user import User

# Register test routes to explicitly test RBAC authorization gates
rbac_test_router = APIRouter(prefix="/api/v1/test-rbac", tags=["Test RBAC"])


@rbac_test_router.get("/admin-only")
async def handle_admin_gate(current_user: User = Depends(require_roles("ADMIN"))):
    return {"success": True, "user": current_user.username, "role": current_user.role_id}


@rbac_test_router.get("/central-or-state")
async def handle_multi_role_gate(
    current_user: User = Depends(require_roles("CENTRAL_OFFICER", "STATE_OFFICER"))
):
    return {"success": True, "user": current_user.username, "role": current_user.role_id}


@rbac_test_router.get("/district-only")
async def handle_district_gate(
    current_user: User = Depends(require_roles("DISTRICT_OFFICER"))
):
    return {"success": True, "user": current_user.username, "role": current_user.role_id}


app.include_router(rbac_test_router)


async def get_token_for(client: AsyncClient, email: str) -> str:
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": email, "password": settings.DEMO_USER_PASSWORD},
    )
    assert res.status_code == 200
    return res.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_admin_only_gate_permitted():
    """Verify ADMIN user can access admin-only endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await get_token_for(client, "admin@gov.demo")
        res = await client.get(
            "/api/v1/test-rbac/admin-only",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert res.status_code == 200
        assert res.json()["success"] is True
        assert res.json()["role"] == "ROLE_ADMIN"


@pytest.mark.asyncio
async def test_admin_only_gate_forbidden_for_field_officer():
    """Verify FIELD_OFFICER cannot access admin-only endpoint (403)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        field_token = await get_token_for(client, "field@gov.demo")
        res = await client.get(
            "/api/v1/test-rbac/admin-only",
            headers={"Authorization": f"Bearer {field_token}"},
        )
        assert res.status_code == 403
        body = res.json()
        assert body["success"] is False
        assert body["error"]["code"] == "FORBIDDEN_ROLE"


@pytest.mark.asyncio
async def test_admin_only_gate_forbidden_for_central_officer():
    """Verify CENTRAL_OFFICER cannot access admin-only endpoint (403)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        central_token = await get_token_for(client, "central@gov.demo")
        res = await client.get(
            "/api/v1/test-rbac/admin-only",
            headers={"Authorization": f"Bearer {central_token}"},
        )
        assert res.status_code == 403
        assert res.json()["error"]["code"] == "FORBIDDEN_ROLE"


@pytest.mark.asyncio
async def test_multi_role_gate_permitted():
    """Verify CENTRAL_OFFICER and STATE_OFFICER can access multi-role endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        central_token = await get_token_for(client, "central@gov.demo")
        res1 = await client.get(
            "/api/v1/test-rbac/central-or-state",
            headers={"Authorization": f"Bearer {central_token}"},
        )
        assert res1.status_code == 200

        state_token = await get_token_for(client, "state@gov.demo")
        res2 = await client.get(
            "/api/v1/test-rbac/central-or-state",
            headers={"Authorization": f"Bearer {state_token}"},
        )
        assert res2.status_code == 200


@pytest.mark.asyncio
async def test_multi_role_gate_forbidden_for_agency_and_field():
    """Verify PROJECT_AGENCY and FIELD_OFFICER are denied on central/state endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        agency_token = await get_token_for(client, "agency@gov.demo")
        res1 = await client.get(
            "/api/v1/test-rbac/central-or-state",
            headers={"Authorization": f"Bearer {agency_token}"},
        )
        assert res1.status_code == 403

        field_token = await get_token_for(client, "field@gov.demo")
        res2 = await client.get(
            "/api/v1/test-rbac/central-or-state",
            headers={"Authorization": f"Bearer {field_token}"},
        )
        assert res2.status_code == 403


@pytest.mark.asyncio
async def test_jurisdiction_scoping_rules():
    """Verify check_jurisdiction correctly scopes national, state, and district authorities."""
    central_user = User(role_id="ROLE_CENTRAL_OFFICER", state_id=None, district_id=None)
    admin_user = User(role_id="ROLE_ADMIN", state_id=None, district_id=None)
    state_user = User(role_id="ROLE_STATE_OFFICER", state_id="IN-RJ", district_id=None)
    district_user = User(role_id="ROLE_DISTRICT_OFFICER", state_id="IN-RJ", district_id="DST-JAI")
    field_user = User(role_id="ROLE_FIELD_OFFICER", state_id="IN-RJ", district_id="DST-JAI")

    # Central and Admin have national scope
    assert check_jurisdiction(central_user, state_id="IN-RJ", district_id="DST-JAI") is True
    assert check_jurisdiction(central_user, state_id="IN-HR", district_id="DST-GUR") is True
    assert check_jurisdiction(admin_user, state_id="IN-RJ") is True

    # State officer scoped to own state
    assert check_jurisdiction(state_user, state_id="IN-RJ") is True
    assert check_jurisdiction(state_user, state_id="IN-HR") is False

    # District officer scoped to own district
    assert check_jurisdiction(district_user, state_id="IN-RJ", district_id="DST-JAI") is True
    assert check_jurisdiction(district_user, state_id="IN-RJ", district_id="DST-ALW") is False

    # Field officer scoped to own district
    assert check_jurisdiction(field_user, district_id="DST-JAI") is True
    assert check_jurisdiction(field_user, district_id="DST-ALW") is False


@pytest.mark.asyncio
async def test_all_canonical_demo_accounts():
    """Verify all canonical demo accounts can authenticate and return expected roles."""
    expected_accounts = [
        ("central@gov.demo", "ROLE_CENTRAL_OFFICER"),
        ("state@gov.demo", "ROLE_STATE_OFFICER"),
        ("district@gov.demo", "ROLE_DISTRICT_OFFICER"),
        ("agency@gov.demo", "ROLE_PROJECT_AGENCY"),
        ("field@gov.demo", "ROLE_FIELD_OFFICER"),
        ("randr@gov.demo", "ROLE_SOCIAL_OFFICER"),
        ("admin@gov.demo", "ROLE_ADMIN"),
    ]
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        for email, expected_role in expected_accounts:
            res = await client.post(
                "/api/v1/auth/login",
                json={"username_or_email": email, "password": settings.DEMO_USER_PASSWORD},
            )
            assert res.status_code == 200, f"Failed for {email}: {res.text}"
            body = res.json()
            assert body["data"]["user"]["role_id"] == expected_role

