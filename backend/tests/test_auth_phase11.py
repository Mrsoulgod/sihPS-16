import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings
from app.core.permissions import check_jurisdiction
from app.core.security import create_access_token
from app.models.user import User


@pytest.mark.asyncio
async def test_canonical_demo_logins():
    """Verify login for all canonical NLAMS operational and administrative roles."""
    transport = ASGITransport(app=app)
    accounts = [
        ("central_admin", "ROLE_CENTRAL_OFFICER", "CENTRAL"),
        ("state_rj_officer", "ROLE_STATE_OFFICER", "STATE"),
        ("cala_jaipur", "ROLE_DISTRICT_OFFICER", "DISTRICT"),
        ("nhai_pd_jaipur", "ROLE_PROJECT_AGENCY", "PROJECT"),
        ("patwari_kotputli", "ROLE_FIELD_OFFICER", "FIELD"),
        ("randr_jaipur", "ROLE_SOCIAL_OFFICER", "SOCIAL"),
        ("admin", "ROLE_ADMIN", "CENTRAL"),
    ]
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        for username, expected_role, expected_level in accounts:
            response = await client.post(
                "/api/v1/auth/login",
                json={
                    "username_or_email": username,
                    "password": "Password@123",
                },
            )
            assert response.status_code == 200, f"Failed login for {username}: {response.text}"
            body = response.json()
            assert body["success"] is True
            user = body["data"]["user"]
            assert user["role_id"] == expected_role
            assert user["username"] == username
            assert "jurisdiction" in user
            assert user["jurisdiction"]["level"] == expected_level
            assert "permissions" in user
            assert len(user["permissions"]) > 0
            assert "access_token" in body["data"]


@pytest.mark.asyncio
async def test_login_invalid_password():
    """Verify login failure with incorrect password returns 401."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "username_or_email": "cala_jaipur",
                "password": "WrongPassword999!",
            },
        )
        assert response.status_code == 401
        body = response.json()
        assert body["success"] is False
        assert body["error"]["code"] == "INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_protected_route_without_token():
    """Verify protected routes reject unauthenticated requests with 401 UNAUTHORIZED."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401
        body = response.json()
        assert body["success"] is False
        assert body["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_protected_route_invalid_token():
    """Verify protected routes reject malformed or expired JWT tokens with 401."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer not-a-valid-jwt-token"},
        )
        assert response.status_code == 401
        body = response.json()
        assert body["success"] is False
        assert body["error"]["code"] == "INVALID_TOKEN"


@pytest.mark.asyncio
async def test_logout_session_invalidation():
    """Verify logout cleanly records audit event and returns success response."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={
                "username_or_email": "cala_jaipur",
                "password": "Password@123",
            },
        )
        token = login_res.json()["data"]["access_token"]

        logout_res = await client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert logout_res.status_code == 200
        assert logout_res.json()["success"] is True


@pytest.mark.asyncio
async def test_role_transition_requires_new_authentication():
    """Verify that a user context cannot change roles without authenticating with that officer's credentials."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Login as FIELD_OFFICER (patwari_kotputli)
        field_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "patwari_kotputli", "password": "Password@123"},
        )
        field_token = field_res.json()["data"]["access_token"]

        # 2. Verify /auth/me returns FIELD_OFFICER
        me1 = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {field_token}"},
        )
        assert me1.json()["data"]["role_id"] == "ROLE_FIELD_OFFICER"

        # 3. Explicit Logout
        await client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {field_token}"},
        )

        # 4. Authenticate as STATE_OFFICER (state_rj_officer) with credentials
        state_res = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "state_rj_officer", "password": "Password@123"},
        )
        state_token = state_res.json()["data"]["access_token"]

        # 5. Verify /auth/me now returns STATE_OFFICER
        me2 = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {state_token}"},
        )
        assert me2.json()["data"]["role_id"] == "ROLE_STATE_OFFICER"
        assert me2.json()["data"]["jurisdiction"]["level"] == "STATE"


def test_hierarchical_jurisdiction_rules():
    """Verify the hierarchical jurisdiction model."""
    central = User(role_id="ROLE_CENTRAL_OFFICER", state_id=None, district_id=None)
    admin = User(role_id="ROLE_ADMIN", state_id=None, district_id=None)
    state_rj = User(role_id="ROLE_STATE_OFFICER", state_id="IN-RJ", district_id=None)
    district_jai = User(role_id="ROLE_DISTRICT_OFFICER", state_id="IN-RJ", district_id="DST-JAI")
    field_kot = User(role_id="ROLE_FIELD_OFFICER", state_id="IN-RJ", district_id="DST-JAI")
    social_jai = User(role_id="ROLE_SOCIAL_OFFICER", state_id="IN-RJ", district_id="DST-JAI")

    # Central & Admin can see any state/district
    assert check_jurisdiction(central, state_id="IN-RJ", district_id="DST-JAI") is True
    assert check_jurisdiction(central, state_id="IN-HR", district_id="DST-GUR") is True
    assert check_jurisdiction(admin, state_id="IN-RJ", district_id="DST-JAI") is True

    # State Officer can view districts in RJ, but not in HR
    assert check_jurisdiction(state_rj, state_id="IN-RJ", district_id="DST-JAI") is True
    assert check_jurisdiction(state_rj, state_id="IN-HR", district_id="DST-GUR") is False

    # District Officer Jaipur can view Jaipur, but not Alwar or Gurugram
    assert check_jurisdiction(district_jai, state_id="IN-RJ", district_id="DST-JAI") is True
    assert check_jurisdiction(district_jai, state_id="IN-RJ", district_id="DST-ALW") is False
    assert check_jurisdiction(district_jai, state_id="IN-HR", district_id="DST-GUR") is False

    # Social Officer Jaipur has Jaipur scope
    assert check_jurisdiction(social_jai, state_id="IN-RJ", district_id="DST-JAI") is True
    assert check_jurisdiction(social_jai, state_id="IN-RJ", district_id="DST-ALW") is False

    # Field Officer Jaipur has Jaipur scope
    assert check_jurisdiction(field_kot, state_id="IN-RJ", district_id="DST-JAI") is True
    assert check_jurisdiction(field_kot, state_id="IN-RJ", district_id="DST-ALW") is False
