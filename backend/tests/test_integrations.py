import pytest
from app.services.integration_service import IntegrationService
from app.schemas.integrations import IntegrationTestRequest


def test_integration_gateway_list_deterministic():
    """Verify that IntegrationService returns all 4 standard Sandbox connectors."""
    gateways = IntegrationService.get_gateways_list()
    assert len(gateways) == 4
    codes = [g.code for g in gateways]
    assert "BHULEKH_LAND_RECORDS" in codes
    assert "BHUVAN_CADASTRAL_GIS" in codes
    assert "PFMS_DBT_FINANCIAL" in codes
    assert "NOTIFICATION_GATEWAY_SMS" in codes

    for g in gateways:
        assert g.status == "SANDBOX_ACTIVE"
        assert len(g.supported_operations) >= 2
        assert g.endpoint_url.startswith("https://")


@pytest.mark.asyncio
async def test_integration_bhulekh_execution():
    """Verify that Land Records Sandbox execution returns legally grounded verified fields."""
    req = IntegrationTestRequest(
        operation="VERIFY_KHASRA_TITLE",
        parameters={"state_code": "RJ", "khasra_no": "101/1"}
    )
    # Call directly with db=None or mock session
    class MockDB:
        async def execute(self, stmt):
            class MockResult:
                def scalars(self):
                    class MockScalars:
                        def first(self):
                            return None
                    return MockScalars()
            return MockResult()
        def add(self, item): pass
        async def commit(self): pass

    resp = await IntegrationService.execute_sandbox_test(
        db=MockDB(),
        code="BHULEKH_LAND_RECORDS",
        req=req,
        current_user=None,
    )
    assert resp.status == "SUCCESS"
    assert resp.integration_code == "BHULEKH_LAND_RECORDS"
    assert "recorded_title_holder" in resp.response_data
    assert "mutation_status" in resp.response_data
    assert resp.response_data["title_verification_status"] == "TITLE_LEGALLY_VALID"
    assert resp.latency_ms > 0
