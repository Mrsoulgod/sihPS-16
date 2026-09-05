import pytest
from app.services.master_data_service import MasterDataService


def test_master_data_taxonomy_integrity():
    """Verify master data categories and statutory taxonomy values."""
    categories = MasterDataService.get_standardized_taxonomy()
    assert len(categories) == 4
    cat_ids = [c.category_id for c in categories]
    assert "CAT-ROLES" in cat_ids
    assert "CAT-STAGES" in cat_ids
    assert "CAT-LAND-PARCELS" in cat_ids
    assert "CAT-RANDR-ENTITLEMENTS" in cat_ids


def test_statutory_parameters_master():
    """Verify RFCTLARR statutory rules and calculation parameters."""
    params = MasterDataService.get_statutory_parameters()
    assert params.solatium_multiplier_percent == 100.0
    assert params.statutory_additional_interest_percent == 12.0
    assert params.section_15_objection_window_days == 60
    assert params.section_25_statutory_lapse_months == 12
    assert sum(params.risk_weights_distribution.values()) == 100.0
