import time

from fastapi.testclient import TestClient


def _wait_for_run(
    client: TestClient,
    project_id: str,
    run_id: str,
    headers: dict[str, str],
) -> dict:
    for _ in range(40):
        detail = client.get(
            f"/api/v1/projects/{project_id}/runs/{run_id}",
            headers=headers,
        )
        assert detail.status_code == 200
        body = detail.json()
        if body["status"] in ("completed", "completed_with_warnings", "failed"):
            return body
        time.sleep(0.1)
    raise AssertionError("Run did not complete in time")


def test_run_artifacts_endpoints(
    client: TestClient, project_id: str, auth_headers: dict[str, str]
) -> None:
    create_response = client.post(
        f"/api/v1/projects/{project_id}/runs",
        json={},
        headers=auth_headers,
    )
    assert create_response.status_code == 201
    run_id = create_response.json()["id"]

    completed = _wait_for_run(client, project_id, run_id, auth_headers)
    assert completed["result"] is not None

    events = client.get(
        f"/api/v1/projects/{project_id}/runs/{run_id}/events",
        headers=auth_headers,
    )
    assert events.status_code == 200
    assert len(events.json()["events"]) > 0

    trace = client.get(
        f"/api/v1/projects/{project_id}/runs/{run_id}/trace",
        headers=auth_headers,
    )
    assert trace.status_code == 200
    trace_body = trace.json()
    assert "frames" in trace_body
    assert "meta" in trace_body
    assert len(trace_body["frames"]) > 0

    metrics = client.get(
        f"/api/v1/projects/{project_id}/runs/{run_id}/metrics",
        headers=auth_headers,
    )
    assert metrics.status_code == 200
    assert metrics.json()["metrics"]["total_items"] == 50


def test_compare_runs(client: TestClient, project_id: str, auth_headers: dict[str, str]) -> None:
    run_ids = []
    for _ in range(2):
        create_response = client.post(
            f"/api/v1/projects/{project_id}/runs",
            json={},
            headers=auth_headers,
        )
        assert create_response.status_code == 201
        run_ids.append(create_response.json()["id"])

    for run_id in run_ids:
        _wait_for_run(client, project_id, run_id, auth_headers)

    comparison = client.get(
        f"/api/v1/projects/{project_id}/comparison",
        params={"run_ids": ",".join(run_ids)},
        headers=auth_headers,
    )
    assert comparison.status_code == 200
    items = comparison.json()["runs"]
    assert len(items) == 2
    assert all(item["metrics"] is not None for item in items)


def test_mujoco_run_fails(client: TestClient, project_id: str, auth_headers: dict[str, str]) -> None:
    create_response = client.post(
        f"/api/v1/projects/{project_id}/runs",
        json={"type": "simulation"},
        headers=auth_headers,
    )
    assert create_response.status_code == 201
    run_id = create_response.json()["id"]

    failed = _wait_for_run(client, project_id, run_id, auth_headers)
    assert failed["status"] == "failed"
    assert "MuJoCo" in (failed.get("error_message") or "")
