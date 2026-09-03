from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.enums import AppRole, ExceptionType, OrganizationType
from app.core.security import hash_password
from app.models.exception_models import ExceptionRule
from app.models.master_data import (
    Carrier,
    Inventory,
    NetworkConnection,
    NetworkNode,
    Product,
    Supplier,
    Warehouse,
)
from app.models.organization import Organization
from app.models.planning import InventoryPlan, SupplyPlan, TransportPlan
from app.models.rbac import Permission, Role, RolePermission, UserOrganization, UserRole
from app.models.scenario_models import Recommendation, ScenarioParameter, ScenarioResult, ScenarioRun, ScmScenario
from app.models.shipment import Shipment, ShipmentItem
from app.models.user import User
from app.security.permissions import ALL_PERMISSIONS, ROLE_PERMISSIONS


SYSTEM_ROLE_META: dict[AppRole, tuple[str, str]] = {
    AppRole.ADMIN: ("Администратор", "Управление пользователями, ролями, организациями и аудитом"),
    AppRole.SUPPLY_CHAIN_MANAGER: (
        "Менеджер цепочки поставок",
        "Стратегия, планирование, исполнение и сценарии",
    ),
    AppRole.SUPPLY_PLANNER: ("Планировщик", "Прогнозы и планы без operational approve/apply"),
    AppRole.LOGISTICS_MANAGER: ("Логист", "Транспорт, поставки, отклонения и инциденты"),
    AppRole.ANALYST: ("Аналитик", "Аналитика и сценарии без изменения operational source of truth"),
    AppRole.SUPPLIER: ("Поставщик", "Портал поставщика — только данные своей организации"),
    AppRole.CARRIER: ("Перевозчик", "Портал перевозчика — только назначенные перевозки"),
}


def seed_rbac(db: Session) -> None:
    """Upsert permission catalog and reconcile system role_permissions to ROLE_PERMISSIONS."""
    from app.security.permissions import assert_matrices_valid

    assert_matrices_valid()

    for code in ALL_PERMISSIONS:
        if db.scalars(select(Permission).where(Permission.code == code)).first() is None:
            db.add(Permission(code=code, description=code))
    db.flush()

    perm_by_code = {p.code: p for p in db.scalars(select(Permission)).all()}

    for role_code in AppRole:
        name, description = SYSTEM_ROLE_META[role_code]
        role = db.scalars(select(Role).where(Role.code == role_code.value)).first()
        if role is None:
            role = Role(
                code=role_code.value,
                name=name,
                description=description,
                is_system=True,
                organization_id=None,
            )
            db.add(role)
            db.flush()
        else:
            role.name = name
            role.description = description
            role.is_system = True
            role.organization_id = None

        desired = ROLE_PERMISSIONS.get(role_code, set())
        existing_links = list(
            db.scalars(select(RolePermission).where(RolePermission.role_id == role.id)).all()
        )
        existing_perm_ids = {link.permission_id for link in existing_links}
        desired_perm_ids = {perm_by_code[code].id for code in desired if code in perm_by_code}

        for link in existing_links:
            if link.permission_id not in desired_perm_ids:
                db.delete(link)

        for perm_id in desired_perm_ids - existing_perm_ids:
            db.add(RolePermission(role_id=role.id, permission_id=perm_id))

    db.commit()


def seed_scm_demo(db: Session) -> None:
    seed_rbac(db)

    org = db.scalars(select(Organization).where(Organization.name == "ООО Ритейл")).first()
    if org is None:
        org = Organization(name="ООО Ритейл", type=OrganizationType.CUSTOMER.value)
        db.add(org)
        db.flush()

    user = db.scalars(select(User).where(User.email == "demo@sortcenter.ru")).first()
    if user is None:
        user = User(
            name="Анна Смирнова",
            email="demo@sortcenter.ru",
            password_hash=hash_password("demo123"),
            team="SCM",
        )
        db.add(user)
        db.flush()
    else:
        user.name = "Анна Смирнова"

    if not db.scalars(select(UserOrganization).where(UserOrganization.user_id == user.id)).first():
        db.add(UserOrganization(user_id=user.id, organization_id=org.id, is_primary=True))

    mgr_role = db.scalars(select(Role).where(Role.code == AppRole.LOGISTICS_MANAGER.value)).first()
    existing_role = db.scalars(
        select(UserRole).where(UserRole.user_id == user.id, UserRole.organization_id == org.id)
    ).first()
    if mgr_role and not existing_role:
        db.add(UserRole(user_id=user.id, role_id=mgr_role.id, organization_id=org.id))

    admin = db.scalars(select(User).where(User.email == "admin@sortcenter.ru")).first()
    if admin is None:
        admin = User(
            name="Admin User",
            email="admin@sortcenter.ru",
            password_hash=hash_password("admin123"),
            team="Admin",
        )
        db.add(admin)
        db.flush()
    if not db.scalars(
        select(UserOrganization).where(UserOrganization.user_id == admin.id, UserOrganization.organization_id == org.id)
    ).first():
        db.add(UserOrganization(user_id=admin.id, organization_id=org.id, is_primary=True))
    admin_role = db.scalars(select(Role).where(Role.code == AppRole.ADMIN.value)).first()
    if admin_role and not db.scalars(
        select(UserRole).where(
            UserRole.user_id == admin.id,
            UserRole.role_id == admin_role.id,
            UserRole.organization_id == org.id,
        )
    ).first():
        db.add(UserRole(user_id=admin.id, role_id=admin_role.id, organization_id=org.id))

    if db.scalars(select(Supplier).where(Supplier.organization_id == org.id)).first():
        db.commit()
        return

    # Network nodes
    kazan = NetworkNode(organization_id=org.id, type="HUB", name="Казань", latitude=55.79, longitude=49.12)
    moscow = NetworkNode(organization_id=org.id, type="WAREHOUSE", name="Москва РЦ", latitude=55.75, longitude=37.61, capacity=120000)
    spb = NetworkNode(organization_id=org.id, type="DISTRIBUTION_CENTER", name="СПб", latitude=59.93, longitude=30.31)
    db.add_all([kazan, moscow, spb])
    db.flush()

    lane = NetworkConnection(
        organization_id=org.id,
        source_node_id=kazan.id,
        target_node_id=moscow.id,
        type="TRANSPORT_LANE",
        planned_lead_time_minutes=620,
        capacity=500,
    )
    db.add(lane)

    suppliers = [
        Supplier(organization_id=org.id, name="Supplier A", status="ACTIVE", region="Центральный",
                 product_group="Electronics", otif=0.94, average_lead_time_hours=76.8, incident_rate=0.04,
                 supply_share=0.28, risk_score=22, risk_status="LOW"),
        Supplier(organization_id=org.id, name="Supplier B", status="ACTIVE", region="Поволжье",
                 product_group="Electronics", otif=0.82, average_lead_time_hours=100.8, incident_rate=0.12,
                 supply_share=0.37, risk_score=82, risk_status="HIGH"),
        Supplier(organization_id=org.id, name="Supplier C", status="ACTIVE", region="Северо-Запад",
                 product_group="FMCG", otif=0.91, average_lead_time_hours=67.2, incident_rate=0.06,
                 supply_share=0.35, risk_score=35, risk_status="MEDIUM"),
    ]
    db.add_all(suppliers)

    carriers = [
        Carrier(organization_id=org.id, name="Carrier A", otif=0.93, eta_accuracy=0.88,
                average_delay_minutes=25, transit_time_hours=10, incident_rate=0.05, shipment_count=420, risk_score=20, risk_status="LOW"),
        Carrier(organization_id=org.id, name="Carrier B", otif=0.82, eta_accuracy=0.75,
                average_delay_minutes=47, transit_time_hours=12, incident_rate=0.11, shipment_count=380, risk_score=78, risk_status="HIGH"),
        Carrier(organization_id=org.id, name="Carrier C", otif=0.89, eta_accuracy=0.85,
                average_delay_minutes=31, transit_time_hours=11, incident_rate=0.07, shipment_count=290, risk_score=40, risk_status="MEDIUM"),
    ]
    db.add_all(carriers)

    wh = Warehouse(organization_id=org.id, node_id=moscow.id, name="Москва РЦ", capacity=120000)
    db.add(wh)
    db.flush()

    products = [
        Product(organization_id=org.id, sku="SKU-4421", name="Product Alpha", product_group="Electronics"),
        Product(organization_id=org.id, sku="SKU-8810", name="Product Beta", product_group="Electronics"),
    ]
    db.add_all(products)
    db.flush()

    db.add(Inventory(
        organization_id=org.id, sku_id=products[0].id, warehouse_id=wh.id,
        current_stock=6100, incoming=4800, safety_stock=3000,
        days_of_supply=3.7, stockout_probability=0.72, status="HIGH",
    ))

    db.add(SupplyPlan(organization_id=org.id, name="Supply Plan Q3", status="ACTIVE", version=13))
    db.add(InventoryPlan(organization_id=org.id, name="Inventory Plan Q3", status="ACTIVE"))
    db.add(TransportPlan(organization_id=org.id, name="Transport Plan Q3", status="ACTIVE"))

    scenario = ScmScenario(organization_id=org.id, name="Supplier B -40%", status="COMPLETED")
    db.add(scenario)
    db.flush()
    db.add(ScenarioParameter(
        scenario_id=scenario.id,
        category="Supplier",
        entity_type="Supplier",
        entity_id=suppliers[1].id,
        parameter="Поставщик B",
        operation="Мощность -40%",
        value=0.0,
    ))
    scenario_run = ScenarioRun(
        scenario_id=scenario.id,
        organization_id=org.id,
        status="COMPLETED",
        progress=100,
        stage="FINALIZING",
    )
    db.add(scenario_run)
    db.flush()
    db.add(ScenarioResult(
        run_id=scenario_run.id,
        service_level=0.93,
        otif=0.79,
        logistics_cost=13_100_000,
        average_lead_time_hours=100.8,
        stockout_risk=0.31,
        risk_status="HIGH",
        semantic_status="RISK",
    ))

    scenario_alt = ScmScenario(organization_id=org.id, name="Carrier C unavailable", status="COMPLETED")
    db.add(scenario_alt)
    db.flush()
    alt_run = ScenarioRun(
        scenario_id=scenario_alt.id,
        organization_id=org.id,
        status="COMPLETED",
        progress=100,
        stage="FINALIZING",
    )
    db.add(alt_run)
    db.flush()
    db.add(ScenarioResult(
        run_id=alt_run.id,
        service_level=0.95,
        otif=0.93,
        logistics_cost=12_900_000,
        average_lead_time_hours=72,
        stockout_risk=0.09,
        risk_status="LOW",
        semantic_status="BEST",
    ))

    db.add(Recommendation(
        organization_id=org.id,
        scenario_id=scenario.id,
        action="REALLOCATE_SUPPLIER_VOLUME",
        description="Перераспределить 14% объёма Supplier B на Supplier A",
        effects_json='{"otif":{"before":0.79,"after":0.93},"stockout_risk":{"before":0.31,"after":0.09},"cost_delta":0.04}',
        semantic_status="RECOMMENDED",
    ))

    db.add(ExceptionRule(
        organization_id=org.id,
        name="Vehicle stopped > 90 min",
        rule_type="STOP_DURATION",
        threshold_value=90,
        exception_type=ExceptionType.VEHICLE_STOP.value,
    ))
    db.add(ExceptionRule(
        organization_id=org.id,
        name="SLA breach probability > 80%",
        rule_type="SLA_RISK",
        threshold_value=80,
        exception_type=ExceptionType.ETA_RISK.value,
    ))

    now = datetime.now(timezone.utc)
    for i in range(20):
        at_risk = i < 5
        shipment = Shipment(
            organization_id=org.id,
            external_ref=f"SH-{100 + i:04d}",
            supplier_id=suppliers[i % 3].id,
            carrier_id=carriers[i % 3].id,
            origin_id=kazan.id,
            destination_id=moscow.id,
            status="IN_TRANSIT",
            planned_pickup_at=now - timedelta(hours=6),
            planned_delivery_at=now + timedelta(hours=2),
            forecast_eta=now + timedelta(hours=5 if at_risk else 2, minutes=25 if at_risk else 10),
            deviation_minutes=205 if at_risk else 10,
            sla_risk=0.92 if at_risk else 0.12,
            risk_status="CRITICAL" if at_risk else "LOW",
        )
        db.add(shipment)
        db.flush()
        db.add(ShipmentItem(shipment_id=shipment.id, sku_id=products[0].id, quantity=4800 if at_risk else 1200))

    db.commit()
