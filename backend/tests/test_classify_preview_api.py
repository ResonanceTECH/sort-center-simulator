
import pytest
from fastapi.testclient import TestClient

from sim.catalog.mesh_factory import build_all_meshes


@pytest.fixture(scope="module", autouse=True)
def _meshes():
    build_all_meshes()


def test_classify_preview_endpoint(
    client: TestClient, project_id: str, auth_headers: dict[str, str]
) -> None:
    scenarios = client.get(
        f"/api/v1/projects/{project_id}/scenarios",
        headers=auth_headers,
    )
    scenario_id = scenarios.json()["scenarios"][0]["id"]

    response = client.post(
        f"/api/v1/projects/{project_id}/scenarios/{scenario_id}/classify-preview",
        json={"product_id": "bottle"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["zone"] == "D"
    assert body["product_id"] == "bottle"
    assert body["k_max"] > 0.8
