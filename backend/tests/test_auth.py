import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings


@pytest.mark.asyncio
async def test_login_success_with_email():
    """Verify login with email and valid password."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "username_or_email": "central@gov.demo",
                "password": settings.DEMO_USER_PASSWORD,
            },
        )
        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True
        data = body["data"]
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in_seconds"] > 0
        user = data["user"]
        assert user["username"] == "central_officer"
        assert user["email"] == "central@gov.demo"
        assert user["role_id"] == "ROLE_CENTRAL_OFFICER"
        assert "hashed_password" not in user
        assert "password" not in user
        assert "metadata" in body
        assert "request_id" in body["metadata"]


@pytest.mark.asyncio
async def test_login_success_with_username():
    """Verify login with username and valid password."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "username_or_email": "cala_jaipur",
                "password": settings.DEMO_USER_PASSWORD,
            },
        )
        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True
        assert body["data"]["user"]["role_id"] == "ROLE_DISTRICT_OFFICER"
        assert body["data"]["user"]["district_id"] == "DST-JAI"


@pytest.mark.asyncio
async def test_login_invalid_password():
    """Verify login failure with incorrect password returns 401."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "username_or_email": "central@gov.demo",
                "password": "WrongPassword123!",
            },
        )
        assert response.status_code == 401
        body = response.json()
        assert body["success"] is False
        assert body["error"]["code"] == "INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_login_nonexistent_user():
    """Verify login failure with nonexistent user returns 401."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "username_or_email": "nonexistent_officer@gov.demo",
                "password": "somepassword",
            },
        )
        assert response.status_code == 401
        body = response.json()
        assert body["success"] is False
        assert body["error"]["code"] == "INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_get_me_profile():
    """Verify /auth/me returns current user data with valid bearer token."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Step 1: Login
        login_res = await client.post(
            "/api/v1/auth/login",
            json={
                "username_or_email": "state@gov.demo",
                "password": settings.DEMO_USER_PASSWORD,
            },
        )
        assert login_res.status_code == 200
        token = login_res.json()["data"]["access_token"]

        # Step 2: Request /auth/me
        me_res = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me_res.status_code == 200
        body = me_res.json()
        assert body["success"] is True
        data = body["data"]
        assert data["username"] == "state_officer"
        assert data["role_id"] == "ROLE_STATE_OFFICER"
        assert data["state_id"] == "IN-RJ"
        assert "hashed_password" not in data


@pytest.mark.asyncio
async def test_get_me_unauthorized():
    """Verify /auth/me without authorization header returns 401."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401
        body = response.json()
        assert body["success"] is False
        assert body["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_get_me_invalid_token():
    """Verify /auth/me with an invalid token returns 401."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer completely-invalid-token-string"},
        )
        assert response.status_code == 401
        body = response.json()
        assert body["success"] is False
        assert body["error"]["code"] == "INVALID_OR_EXPIRED_TOKEN"


@pytest.mark.asyncio
async def test_switch_role():
    """Verify evaluator role switcher endpoint switches context to target role."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Start as CENTRAL_OFFICER
        login_res = await client.post(
            "/api/v1/auth/login",
            json={
                "username_or_email": "central@gov.demo",
                "password": settings.DEMO_USER_PASSWORD,
            },
        )
        assert login_res.status_code == 200
        token = login_res.json()["data"]["access_token"]

        # Switch to FIELD_OFFICER
        switch_res = await client.post(
            "/api/v1/auth/switch-role",
            headers={"Authorization": f"Bearer {token}"},
            json={"target_role": "ROLE_FIELD_OFFICER"},
        )
        assert switch_res.status_code == 200
        body = switch_res.json()
        assert body["success"] is True
        assert body["data"]["user"]["role_id"] == "ROLE_FIELD_OFFICER"
        assert body["data"]["user"]["username"] == "field_officer"

        # Check new token works on /auth/me
        new_token = body["data"]["access_token"]
        me_res = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {new_token}"},
        )
        assert me_res.status_code == 200
        assert me_res.json()["data"]["role_id"] == "ROLE_FIELD_OFFICER"


@pytest.mark.asyncio
async def test_logout():
    """Verify logout records session termination and returns success."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={
                "username_or_email": "admin@gov.demo",
                "password": settings.DEMO_USER_PASSWORD,
            },
        )
        token = login_res.json()["data"]["access_token"]

        logout_res = await client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert logout_res.status_code == 200
        body = logout_res.json()
        assert body["success"] is True
        assert "closed" in body["message"]
