import time

from fastapi.testclient import TestClient


def test_health(client: TestClient) -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200


def test_create_and_get_project(
    client: TestClient, project_id: str, auth_headers: dict[str, str]
) -> None:
    detail = client.get(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert detail.status_code == 200
    body = detail.json()
    assert body["name"] == "Тестовый проект"
    assert body["default_scenario_id"] is not None
    assert body["my_role"] == "owner"


def test_list_scenarios(client: TestClient, project_id: str, auth_headers: dict[str, str]) -> None:
    response = client.get(f"/api/v1/projects/{project_id}/scenarios", headers=auth_headers)
    assert response.status_code == 200
    scenarios = response.json()["scenarios"]
    assert len(scenarios) >= 1
    assert scenarios[0]["is_default"] is True


def test_post_run_completes(
    client: TestClient, project_id: str, auth_headers: dict[str, str]
) -> None:
    create_response = client.post(
        f"/api/v1/projects/{project_id}/runs",
        json={},
        headers=auth_headers,
    )
    assert create_response.status_code == 201
    run_id = create_response.json()["id"]
    assert create_response.json()["status"] == "queued"

    completed = None
    for _ in range(30):
        detail = client.get(
            f"/api/v1/projects/{project_id}/runs/{run_id}",
            headers=auth_headers,
        )
        assert detail.status_code == 200
        if detail.json()["status"] == "completed":
            completed = detail.json()
            break
        time.sleep(0.1)

    assert completed is not None
    assert completed["progress"] == 1.0
    assert completed["result"]["metrics"]["total_items"] == 50
    assert "expect_passed" in completed["result"]
