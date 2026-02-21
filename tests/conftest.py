import pytest
import importlib.util
import copy
from pathlib import Path
from fastapi.testclient import TestClient

# Load the app module from src/app.py so tests can access its `activities` state.
APP_PATH = Path(__file__).resolve().parents[1] / "src" / "app.py"
spec = importlib.util.spec_from_file_location("app_module", str(APP_PATH))
app_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app_module)

# Attach the module to the FastAPI app so tests can reach it via `client.app._module`.
app_module.app._module = app_module


@pytest.fixture
def client():
    return TestClient(app_module.app)


@pytest.fixture
def reset_activities():
    original = copy.deepcopy(app_module.activities)
    try:
        yield
    finally:
        app_module.activities.clear()
        app_module.activities.update(original)
