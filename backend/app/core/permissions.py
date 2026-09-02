from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Optional


class Resource(str, Enum):
    PROJECT = "project"
    PROJECT_SETTINGS = "project_settings"
    MODEL = "model"
    MODEL_BLOCKS = "model_blocks"
    MODEL_CONNECTIONS = "model_connections"
    EQUIPMENT_PARAMS = "equipment_params"
    FLOW_PARAMS = "flow_params"
    SCENARIOS = "scenarios"
    SIMULATION_RUN = "simulation_run"
    SIMULATION_RESULTS = "simulation_results"
    STATISTICS = "statistics"
    COMPARISON = "comparison"
    VISUALIZATION = "visualization"
    REPORTS = "reports"
    TEMPLATES = "templates"
    MEMBERS = "members"


class Action(str, Enum):
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"


ROLE_LABELS = {
    "owner": "Владелец",
    "editor": "Редактор",
    "analyst": "Аналитик",
    "viewer": "Наблюдатель",
}


def _crud() -> set[tuple[Resource, Action]]:
    actions = {Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE}
    return {(resource, action) for resource in Resource for action in actions}


def _matrix(
    *,
    project: str,
    project_settings: str,
    model: str,
    model_blocks: str,
    model_connections: str,
    equipment_params: str,
    flow_params: str,
    scenarios: str,
    simulation_run: str,
    simulation_results: str,
    statistics: str,
    comparison: str,
    visualization: str,
    reports: str,
    templates: str,
    members: str,
) -> set[tuple[Resource, Action]]:
    mapping = {
        Resource.PROJECT: project,
        Resource.PROJECT_SETTINGS: project_settings,
        Resource.MODEL: model,
        Resource.MODEL_BLOCKS: model_blocks,
        Resource.MODEL_CONNECTIONS: model_connections,
        Resource.EQUIPMENT_PARAMS: equipment_params,
        Resource.FLOW_PARAMS: flow_params,
        Resource.SCENARIOS: scenarios,
        Resource.SIMULATION_RUN: simulation_run,
        Resource.SIMULATION_RESULTS: simulation_results,
        Resource.STATISTICS: statistics,
        Resource.COMPARISON: comparison,
        Resource.VISUALIZATION: visualization,
        Resource.REPORTS: reports,
        Resource.TEMPLATES: templates,
        Resource.MEMBERS: members,
    }
    action_map = {
        "C": Action.CREATE,
        "R": Action.READ,
        "U": Action.UPDATE,
        "D": Action.DELETE,
    }
    permissions: set[tuple[Resource, Action]] = set()
    for resource, mask in mapping.items():
        if mask == "-":
            continue
        for char in mask:
            permissions.add((resource, action_map[char]))
    return permissions


ROLE_PERMISSIONS: dict[str, set[tuple[Resource, Action]]] = {
    "owner": _matrix(
        project="CRUD",
        project_settings="CRUD",
        model="CRUD",
        model_blocks="CRUD",
        model_connections="CRUD",
        equipment_params="CRUD",
        flow_params="CRUD",
        scenarios="CRUD",
        simulation_run="CRUD",
        simulation_results="CRUD",
        statistics="CRUD",
        comparison="CRUD",
        visualization="CRUD",
        reports="CRUD",
        templates="CRUD",
        members="CRUD",
    ),
    "editor": _matrix(
        project="RU",
        project_settings="RU",
        model="CRUD",
        model_blocks="CRUD",
        model_connections="CRUD",
        equipment_params="CRUD",
        flow_params="CRUD",
        scenarios="CRUD",
        simulation_run="CR",
        simulation_results="R",
        statistics="R",
        comparison="R",
        visualization="R",
        reports="CRU",
        templates="CR",
        members="-",
    ),
    "analyst": _matrix(
        project="R",
        project_settings="R",
        model="R",
        model_blocks="R",
        model_connections="R",
        equipment_params="R",
        flow_params="R",
        scenarios="CRU",
        simulation_run="CR",
        simulation_results="R",
        statistics="R",
        comparison="CRU",
        visualization="R",
        reports="CRU",
        templates="CR",
        members="-",
    ),
    "viewer": _matrix(
        project="R",
        project_settings="R",
        model="R",
        model_blocks="R",
        model_connections="R",
        equipment_params="R",
        flow_params="R",
        scenarios="R",
        simulation_run="R",
        simulation_results="R",
        statistics="R",
        comparison="R",
        visualization="R",
        reports="R",
        templates="R",
        members="-",
    ),
}


@dataclass(frozen=True)
class RoleCapabilities:
    delete_project: bool
    copy_project: bool
    set_default_scenario: bool
    export_csv: bool
    manage_members: bool


CAPABILITIES_BY_ROLE: dict[str, RoleCapabilities] = {
    "owner": RoleCapabilities(
        delete_project=True,
        copy_project=True,
        set_default_scenario=True,
        export_csv=True,
        manage_members=True,
    ),
    "editor": RoleCapabilities(
        delete_project=False,
        copy_project=True,
        set_default_scenario=True,
        export_csv=True,
        manage_members=False,
    ),
    "analyst": RoleCapabilities(
        delete_project=False,
        copy_project=True,
        set_default_scenario=True,
        export_csv=True,
        manage_members=False,
    ),
    "viewer": RoleCapabilities(
        delete_project=False,
        copy_project=False,
        set_default_scenario=False,
        export_csv=False,
        manage_members=False,
    ),
}


def can(role: str, resource: Resource, action: Action) -> bool:
    permissions = ROLE_PERMISSIONS.get(role, set())
    return (resource, action) in permissions


def can_any(role: str, checks: list[tuple[Resource, Action]]) -> bool:
    return any(can(role, resource, action) for resource, action in checks)


def can_all(role: str, checks: list[tuple[Resource, Action]]) -> bool:
    return all(can(role, resource, action) for resource, action in checks)


def get_capabilities(role: str) -> RoleCapabilities:
    return CAPABILITIES_BY_ROLE.get(role, CAPABILITIES_BY_ROLE["viewer"])


def build_access_profile(role: str) -> dict:
    permissions = ROLE_PERMISSIONS.get(role, set())
    grouped: dict[str, list[str]] = {}
    for resource, action in permissions:
        grouped.setdefault(resource.value, []).append(action.value)
    for values in grouped.values():
        values.sort()

    caps = get_capabilities(role)
    return {
        "role": role,
        "role_label": ROLE_LABELS.get(role, role),
        "permissions": grouped,
        "capabilities": {
            "delete_project": caps.delete_project,
            "copy_project": caps.copy_project,
            "set_default_scenario": caps.set_default_scenario,
            "export_csv": caps.export_csv,
            "manage_members": caps.manage_members,
        },
    }


def assert_role(role: Optional[str]) -> str:
    if role not in ROLE_PERMISSIONS:
        raise ValueError(f"Unknown role: {role}")
    return role
