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
async def test_get_statutory_stages():
    """Verify all 12 statutory acquisition stages are returned with SLA rules."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/workflow/stages")
        assert res.status_code == 200
        stages = res.json()
        assert len(stages) == 12
        assert stages[0]["stage_code"] == "PROJECT_PROPOSAL"
        assert stages[1]["stage_code"] == "INITIAL_SCRUTINY"
        assert stages[4]["stage_code"] == "NOTIFICATION"
        assert stages[5]["stage_code"] == "OBJECTION_HEARING"
        assert stages[11]["stage_code"] == "COMPLETION"


@pytest.mark.asyncio
async def test_project_workflow_timeline():
    """Verify project timeline retrieval with SLA compliance."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "district@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}

        # Get projects
        proj_res = await client.get("/api/v1/projects", headers=headers)
        assert proj_res.status_code == 200
        projects = proj_res.json()
        assert len(projects) > 0
        target_project = projects[0]

        # Get workflow timeline
        res = await client.get(f"/api/v1/workflow/projects/{target_project['id']}/timeline", headers=headers)
        assert res.status_code == 200
        timeline = res.json()
        assert timeline["project_code"] == target_project["project_code"]
        assert len(timeline["stages"]) == 12
        assert "overall_progress_percent" in timeline
        assert "is_current_stage_overdue" in timeline


@pytest.mark.asyncio
async def test_unauthorized_stage_transition():
    """Verify Field Officer is forbidden from approving administrative acquisition stages."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        field_token = await get_token_for(client, "field@gov.demo")
        headers = {"Authorization": f"Bearer {field_token}"}

        # Get a project
        proj_res = await client.get("/api/v1/projects", headers=headers)
        assert proj_res.status_code == 200
        projects = proj_res.json()
        target = projects[0]

        # Attempt to approve transition
        res = await client.post(
            f"/api/v1/workflow/projects/{target['id']}/transition",
            headers=headers,
            json={"decision": "APPROVED", "remarks": "Unauthorized test attempt"},
        )
        assert res.status_code == 403
        data = res.json()
        error_msg = data.get("error", {}).get("message", "") or data.get("detail", "")
        assert "not authorized" in error_msg.lower() or "jurisdiction" in error_msg.lower()


@pytest.mark.asyncio
async def test_get_and_action_workflow_tasks():
    """Verify workflow task retrieval and resolution."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_token_for(client, "district@gov.demo")
        headers = {"Authorization": f"Bearer {token}"}

        res = await client.get("/api/v1/workflow/tasks", headers=headers)
        assert res.status_code == 200
        tasks = res.json()
        assert isinstance(tasks, list)

        if tasks:
            task = tasks[0]
            action_res = await client.post(
                f"/api/v1/workflow/tasks/{task['id']}/action",
                headers=headers,
                json={"action": "COMPLETE", "remarks": "Task verified and completed in test"},
            )
            assert action_res.status_code == 200
            assert action_res.json()["status"] == "COMPLETED"
