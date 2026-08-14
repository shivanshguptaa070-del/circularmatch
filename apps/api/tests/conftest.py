import pytest
from app.core.dependencies import store


@pytest.fixture(autouse=True)
def setup_test_data():
    store.reset(include_sample_entities=True)
    yield
