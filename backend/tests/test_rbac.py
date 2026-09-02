from fastapi.testclient import TestClient

from app.core.permissions import Action, Resource, can, get_capabilities


def test_create_scenario(client: TestClient, project_id: str, auth_headers: dict[str, str]) -> None:
    scenarios = client.get(f"/api/v1/projects/{project_id}/scenarios", headers=auth_headers)
    base_id = scenarios.json()["scenarios"][0]["id"]

    created = client.post(
        f"/api/v1/projects/{project_id}/scenarios",
        json={"name": "Пиковая нагрузка", "copy_from_id": base_id},
        headers=auth_headers,
    )
    assert created.status_code == 201
    assert created.json()["name"] == "Пиковая нагрузка"

    listed = client.get(f"/api/v1/projects/{project_id}/scenarios", headers=auth_headers)
    assert len(listed.json()["scenarios"]) >= 2
    assert can("owner", Resource.MEMBERS, Action.CREATE)
    assert can("owner", Resource.MEMBERS, Action.DELETE)
    assert get_capabilities("owner").delete_project is True


def test_editor_cannot_manage_members_or_delete_project() -> None:
    assert not can("editor", Resource.MEMBERS, Action.CREATE)
    assert not get_capabilities("editor").delete_project
    assert can("editor", Resource.MODEL, Action.UPDATE)
    assert can("editor", Resource.SIMULATION_RUN, Action.CREATE)


def test_analyst_can_run_but_not_edit_model() -> None:
    assert can("analyst", Resource.SIMULATION_RUN, Action.CREATE)
    assert not can("analyst", Resource.EQUIPMENT_PARAMS, Action.UPDATE)
    assert can("analyst", Resource.COMPARISON, Action.UPDATE)


def test_viewer_is_read_only() -> None:
    assert can("viewer", Resource.PROJECT, Action.READ)
    assert not can("viewer", Resource.SIMULATION_RUN, Action.CREATE)
    assert not get_capabilities("viewer").copy_project


def test_invitation_flow(client: TestClient, project_id: str, auth_headers: dict[str, str]) -> None:
    invite = client.post(
        f"/api/v1/projects/{project_id}/invitations",
        json={"role": "viewer", "expires_in_days": 3},
        headers=auth_headers,
    )
    assert invite.status_code == 201
    code = invite.json()["code"]

    preview = client.get(f"/api/v1/invitations/{code}/preview")
    assert preview.status_code == 200
    assert preview.json()["is_valid"] is True

    guest = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Гость",
            "email": "guest@example.com",
            "password": "guestpass123",
        },
    )
    assert guest.status_code == 201
    guest_headers = {"Authorization": f"Bearer {guest.json()['access_token']}"}

    accepted = client.post(
        "/api/v1/invitations/accept",
        json={"code": code},
        headers=guest_headers,
    )
    assert accepted.status_code == 200
    assert accepted.json()["role"] == "viewer"

    project = client.get(f"/api/v1/projects/{project_id}", headers=guest_headers)
    assert project.status_code == 200
    assert project.json()["my_role"] == "viewer"

    denied = client.patch(
        f"/api/v1/projects/{project_id}",
        json={"name": "Взлом"},
        headers=guest_headers,
    )
    assert denied.status_code == 403
