"""
Global pytest configuration and fixtures for VERITAS AI.
"""

import pytest
from backend.app.core.config import settings

@pytest.fixture(autouse=True)
def configure_test_environment():
    """Ensures tests run deterministically with mock search provider and no live API calls."""
    orig_provider = settings.SEARCH_PROVIDER
    settings.SEARCH_PROVIDER = "mock"
    yield
    settings.SEARCH_PROVIDER = orig_provider
