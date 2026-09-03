"""SCM demo seed — development only. Do not use these credentials in production."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import AppRole, ExceptionType, OrganizationType
from app.core.security import hash_password
from app.models.exception_models import ExceptionRule, Incident, ScmException
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
from app.models.planning import (
    DemandForecast,
    InventoryPlan,
    SupplyAllocation,
    SupplyPlan,
    TransportPlan,
    TransportPlanLane,
)
from app.models.rbac import Permission, Role, RolePermission, UserOrganization, UserRole
from app.models.scenario_models import Recommendation, ScenarioParameter, ScenarioResult, ScenarioRun, ScmScenario
from app.models.shipment import Shipment, ShipmentItem
from app.models.user import User
from app.security.permissions import ALL_PERMISSIONS, ROLE_PERMISSIONS

# Customer org display name (kept for existing tests).
CUSTOMER_ORG_NAME = "ООО Ритейл"
SUPPLIER_ORG_NAME = "ООО Supplier Alpha"
CARRIER_ORG_NAME = "ООО Carrier Vector"

SHIPMENT_STATUSES = (
    "PLANNED",
    "ASSIGNED",
    "ACCEPTED",
    "READY_FOR_PICKUP",
    "IN_TRANSIT",
    "ARRIVED",
    "DELIVERED",
)
RISK_STATUSES = ("NORMAL", "MEDIUM", "HIGH", "CRITICAL", "NO_DATA")

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


def _ensure_org(db: Session, name: str, org_type: str) -> Organization:
    org = db.scalars(select(Organization).where(Organization.name == name)).first()
    if org is None:
        org = Organization(name=name, type=org_type)
        db.add(org)
        db.flush()
    else:
        org.type = org_type
    return org


def _ensure_user(
    db: Session,
    *,
    email: str,
    name: str,
    password: str,
    org: Organization,
    role_code: AppRole,
    team: str = "SCM",
) -> User:
    user = db.scalars(select(User).where(User.email == email)).first()
    if user is None:
        user = User(name=name, email=email, password_hash=hash_password(password), team=team)
        db.add(user)
        db.flush()
    else:
        user.name = name
        user.password_hash = hash_password(password)
        user.team = team

    if not db.scalars(
        select(UserOrganization).where(
            UserOrganization.user_id == user.id,
            UserOrganization.organization_id == org.id,
        )
    ).first():
        db.add(UserOrganization(user_id=user.id, organization_id=org.id, is_primary=True))

    role = db.scalars(select(Role).where(Role.code == role_code.value)).first()
    if role and not db.scalars(
        select(UserRole).where(
            UserRole.user_id == user.id,
            UserRole.role_id == role.id,
            UserRole.organization_id == org.id,
        )
    ).first():
        db.add(UserRole(user_id=user.id, role_id=role.id, organization_id=org.id))
    return user


def seed_demo_accounts(db: Session, customer: Organization, supplier_org: Organization, carrier_org: Organization) -> None:
    """7 system roles — TZ §22. Also keep legacy emails used by tests/FE."""
    # Internal / admin on customer org
    _ensure_user(
        db,
        email="admin@sortcenter.ru",
        name="Admin User",
        password="admin123",
        org=customer,
        role_code=AppRole.ADMIN,
        team="Admin",
    )
    _ensure_user(
        db,
        email="admin@demo.scm.ru",
        name="Admin Demo",
        password="demo123",
        org=customer,
        role_code=AppRole.ADMIN,
        team="Admin",
    )
    _ensure_user(
        db,
        email="manager@demo.scm.ru",
        name="SCM Manager",
        password="demo123",
        org=customer,
        role_code=AppRole.SUPPLY_CHAIN_MANAGER,
    )
    _ensure_user(
        db,
        email="manager@scm.ru",
        name="SCM Manager",
        password="demo123",
        org=customer,
        role_code=AppRole.SUPPLY_CHAIN_MANAGER,
    )
    _ensure_user(
        db,
        email="planner@demo.scm.ru",
        name="Supply Planner",
        password="demo123",
        org=customer,
        role_code=AppRole.SUPPLY_PLANNER,
    )
    _ensure_user(
        db,
        email="planner@scm.ru",
        name="Supply Planner",
        password="demo123",
        org=customer,
        role_code=AppRole.SUPPLY_PLANNER,
    )
    _ensure_user(
        db,
        email="demo@sortcenter.ru",
        name="Анна Смирнова",
        password="demo123",
        org=customer,
        role_code=AppRole.LOGISTICS_MANAGER,
    )
    _ensure_user(
        db,
        email="logistics@demo.scm.ru",
        name="Мария Козлова",
        password="demo123",
        org=customer,
        role_code=AppRole.LOGISTICS_MANAGER,
    )
    _ensure_user(
        db,
        email="logistics@scm.ru",
        name="Мария Козлова",
        password="demo123",
        org=customer,
        role_code=AppRole.LOGISTICS_MANAGER,
    )
    _ensure_user(
        db,
        email="analyst@demo.scm.ru",
        name="Analyst Demo",
        password="demo123",
        org=customer,
        role_code=AppRole.ANALYST,
    )
    _ensure_user(
        db,
        email="analyst@scm.ru",
        name="Аналитик СЦ",
        password="demo123",
        org=customer,
        role_code=AppRole.ANALYST,
    )

    # Portal partners
    _ensure_user(
        db,
        email="supplier@scm.ru",
        name="Supplier Alpha User",
        password="demo123",
        org=supplier_org,
        role_code=AppRole.SUPPLIER,
        team="Portal",
    )
    _ensure_user(
        db,
        email="supplier@demo.scm.ru",
        name="Supplier Alpha User",
        password="demo123",
        org=supplier_org,
        role_code=AppRole.SUPPLIER,
        team="Portal",
    )
    _ensure_user(
        db,
        email="carrier@scm.ru",
        name="Carrier Vector User",
        password="demo123",
        org=carrier_org,
        role_code=AppRole.CARRIER,
        team="Portal",
    )
    _ensure_user(
        db,
        email="carrier@demo.scm.ru",
        name="Carrier Vector User",
        password="demo123",
        org=carrier_org,
        role_code=AppRole.CARRIER,
        team="Portal",
    )


def _seed_master_data(db: Session, org: Organization) -> dict:
    nodes_spec = [
        ("HUB", "Казань", 55.79, 49.12, 80000),
        ("WAREHOUSE", "Москва РЦ", 55.75, 37.61, 120000),
        ("DISTRIBUTION_CENTER", "СПб", 59.93, 30.31, 90000),
        ("WAREHOUSE", "Нижний Новгород", 56.33, 44.00, 45000),
        ("HUB", "Екатеринбург", 56.84, 60.60, 70000),
    ]
    nodes: list[NetworkNode] = []
    for typ, name, lat, lng, cap in nodes_spec:
        node = NetworkNode(
            organization_id=org.id,
            type=typ,
            name=name,
            latitude=lat,
            longitude=lng,
            capacity=cap,
        )
        db.add(node)
        nodes.append(node)
    db.flush()

    lanes: list[NetworkConnection] = []
    lane_pairs = [
        (0, 1, 620, 500),
        (1, 2, 720, 480),
        (0, 3, 300, 350),
        (3, 1, 280, 400),
        (1, 4, 1100, 300),
        (4, 1, 1100, 300),
        (2, 1, 720, 450),
        (0, 2, 1400, 200),
        (3, 2, 900, 250),
        (4, 2, 1600, 180),
    ]
    for src, dst, lead, cap in lane_pairs:
        lane = NetworkConnection(
            organization_id=org.id,
            source_node_id=nodes[src].id,
            target_node_id=nodes[dst].id,
            type="TRANSPORT_LANE",
            planned_lead_time_minutes=lead,
            capacity=cap,
        )
        db.add(lane)
        lanes.append(lane)
    db.flush()

    suppliers = [
        Supplier(
            organization_id=org.id,
            name="Supplier Alpha",
            status="ACTIVE",
            region="Центральный",
            product_group="Electronics",
            otif=0.94,
            average_lead_time_hours=76.8,
            incident_rate=0.04,
            supply_share=0.28,
            risk_score=22,
            risk_status="LOW",
        ),
        Supplier(
            organization_id=org.id,
            name="Supplier B",
            status="ACTIVE",
            region="Поволжье",
            product_group="Electronics",
            otif=0.82,
            average_lead_time_hours=100.8,
            incident_rate=0.12,
            supply_share=0.22,
            risk_score=82,
            risk_status="HIGH",
        ),
        Supplier(
            organization_id=org.id,
            name="Supplier C",
            status="ACTIVE",
            region="Северо-Запад",
            product_group="FMCG",
            otif=0.91,
            average_lead_time_hours=67.2,
            incident_rate=0.06,
            supply_share=0.20,
            risk_score=35,
            risk_status="MEDIUM",
        ),
        Supplier(
            organization_id=org.id,
            name="Supplier D",
            status="ACTIVE",
            region="Урал",
            product_group="FMCG",
            otif=0.88,
            average_lead_time_hours=84.0,
            incident_rate=0.08,
            supply_share=0.18,
            risk_score=48,
            risk_status="MEDIUM",
        ),
        Supplier(
            organization_id=org.id,
            name="Supplier E",
            status="ACTIVE",
            region="Юг",
            product_group="Electronics",
            otif=0.96,
            average_lead_time_hours=60.0,
            incident_rate=0.03,
            supply_share=0.12,
            risk_score=15,
            risk_status="LOW",
        ),
    ]
    db.add_all(suppliers)

    carriers = [
        Carrier(
            organization_id=org.id,
            name="Carrier Vector",
            otif=0.93,
            eta_accuracy=0.88,
            average_delay_minutes=25,
            transit_time_hours=10,
            incident_rate=0.05,
            shipment_count=420,
            risk_score=20,
            risk_status="LOW",
        ),
        Carrier(
            organization_id=org.id,
            name="Carrier B",
            otif=0.82,
            eta_accuracy=0.75,
            average_delay_minutes=47,
            transit_time_hours=12,
            incident_rate=0.11,
            shipment_count=380,
            risk_score=78,
            risk_status="HIGH",
        ),
        Carrier(
            organization_id=org.id,
            name="Carrier C",
            otif=0.89,
            eta_accuracy=0.85,
            average_delay_minutes=31,
            transit_time_hours=11,
            incident_rate=0.07,
            shipment_count=290,
            risk_score=40,
            risk_status="MEDIUM",
        ),
        Carrier(
            organization_id=org.id,
            name="Carrier D",
            otif=0.91,
            eta_accuracy=0.90,
            average_delay_minutes=22,
            transit_time_hours=9,
            incident_rate=0.04,
            shipment_count=210,
            risk_score=28,
            risk_status="LOW",
        ),
    ]
    db.add_all(carriers)
    db.flush()

    warehouses: list[Warehouse] = []
    for node in nodes:
        wh = Warehouse(
            organization_id=org.id,
            node_id=node.id,
            name=node.name,
            capacity=node.capacity,
        )
        db.add(wh)
        warehouses.append(wh)
    db.flush()

    products: list[Product] = []
    for i in range(30):
        products.append(
            Product(
                organization_id=org.id,
                sku=f"SKU-{4000 + i}",
                name=f"Product {chr(65 + (i % 26))}{i // 26 or ''}",
                product_group="Electronics" if i % 2 == 0 else "FMCG",
            )
        )
    db.add_all(products)
    db.flush()

    for i, product in enumerate(products[:12]):
        wh = warehouses[i % len(warehouses)]
        db.add(
            Inventory(
                organization_id=org.id,
                sku_id=product.id,
                warehouse_id=wh.id,
                current_stock=1000 + i * 120,
                incoming=200 + i * 40,
                safety_stock=300,
                days_of_supply=4.0 + (i % 5),
                stockout_probability=0.1 + (i % 7) * 0.08,
                status=RISK_STATUSES[i % len(RISK_STATUSES)],
            )
        )

    return {
        "nodes": nodes,
        "lanes": lanes,
        "suppliers": suppliers,
        "carriers": carriers,
        "warehouses": warehouses,
        "products": products,
    }


def _seed_plans_scenarios(db: Session, org: Organization, master: dict) -> None:
    suppliers: list[Supplier] = master["suppliers"]
    lanes: list[NetworkConnection] = master["lanes"]
    products: list[Product] = master["products"]
    warehouses: list[Warehouse] = master["warehouses"]
    if not products or not warehouses:
        return

    fc_count = db.scalar(
        select(func.count()).select_from(DemandForecast).where(DemandForecast.organization_id == org.id)
    ) or 0
    for i, status in enumerate(("ACTIVE", "CALCULATED", "DRAFT")):
        if fc_count >= 3:
            break
        if i >= len(products):
            break
        db.add(
            DemandForecast(
                organization_id=org.id,
                sku_id=products[i].id,
                warehouse_id=warehouses[i % len(warehouses)].id,
                region="Центральный",
                status=status,
            )
        )
        fc_count += 1

    plan_count = db.scalar(
        select(func.count()).select_from(SupplyPlan).where(SupplyPlan.organization_id == org.id)
    ) or 0
    if plan_count < 2:
        plan_a = SupplyPlan(organization_id=org.id, name="Supply Plan Q3", status="ACTIVE", version=13)
        plan_b = SupplyPlan(organization_id=org.id, name="Supply Plan Q4 Draft", status="REVIEW", version=1)
        db.add_all([plan_a, plan_b])
        db.flush()
        for plan in (plan_a, plan_b):
            for supplier in suppliers[:4]:
                db.add(
                    SupplyAllocation(
                        plan_id=plan.id,
                        supplier_id=supplier.id,
                        volume=12000 + (supplier.risk_score or 0) * 10,
                    )
                )
    else:
        plan_a = db.scalars(
            select(SupplyPlan).where(SupplyPlan.organization_id == org.id).order_by(SupplyPlan.created_at)
        ).first()

    inv_count = db.scalar(
        select(func.count()).select_from(InventoryPlan).where(InventoryPlan.organization_id == org.id)
    ) or 0
    if inv_count < 2:
        db.add(InventoryPlan(organization_id=org.id, name="Inventory Plan Q3", status="ACTIVE", version=3))
        db.add(InventoryPlan(organization_id=org.id, name="Inventory Plan Q4", status="DRAFT", version=1))

    tp_count = db.scalar(
        select(func.count()).select_from(TransportPlan).where(TransportPlan.organization_id == org.id)
    ) or 0
    if tp_count < 2 and lanes:
        tp_a = TransportPlan(organization_id=org.id, name="Transport Plan Q3", status="ACTIVE", version=5)
        tp_b = TransportPlan(organization_id=org.id, name="Transport Plan Ops", status="REVIEW", version=2)
        db.add_all([tp_a, tp_b])
        db.flush()
        for plan in (tp_a, tp_b):
            for idx, lane in enumerate(lanes[:6]):
                deficit = 24.0 if idx < 2 else 0.0
                db.add(
                    TransportPlanLane(
                        plan_id=plan.id,
                        lane_id=lane.id,
                        required_capacity=500 + idx * 10,
                        available_capacity=486 if deficit else 520,
                        deficit=deficit,
                        utilization=1.05 if deficit else 0.82,
                        status="CRITICAL" if deficit else "NORMAL",
                    )
                )

    sc_count = db.scalar(
        select(func.count()).select_from(ScmScenario).where(ScmScenario.organization_id == org.id)
    ) or 0
    if sc_count >= 4:
        return

    scenarios_spec = [
        ("Supplier B -40%", "COMPLETED", suppliers[1] if len(suppliers) > 1 else None),
        ("Carrier C unavailable", "COMPLETED", None),
        ("Lane Moscow-SPb +20%", "DRAFT", None),
        ("Safety stock +15%", "RUNNING", None),
    ]
    scenarios: list[ScmScenario] = []
    base_plan_id = plan_a.id if plan_a else None
    for name, status, supplier in scenarios_spec:
        sc = ScmScenario(organization_id=org.id, name=name, status=status, base_plan_id=base_plan_id)
        db.add(sc)
        scenarios.append(sc)
    db.flush()

    if len(suppliers) > 1:
        db.add(
            ScenarioParameter(
                scenario_id=scenarios[0].id,
                category="Supplier",
                entity_type="Supplier",
                entity_id=suppliers[1].id,
                parameter="Поставщик B",
                operation="Мощность -40%",
                value=0.0,
            )
        )

    for sc, otif, risk in (
        (scenarios[0], 0.79, "HIGH"),
        (scenarios[1], 0.93, "LOW"),
    ):
        run = ScenarioRun(
            scenario_id=sc.id,
            organization_id=org.id,
            status="COMPLETED",
            progress=100,
            stage="FINALIZING",
        )
        db.add(run)
        db.flush()
        db.add(
            ScenarioResult(
                run_id=run.id,
                service_level=0.93,
                otif=otif,
                logistics_cost=13_100_000,
                average_lead_time_hours=100.8,
                stockout_risk=0.31 if risk == "HIGH" else 0.09,
                risk_status=risk,
                semantic_status="RISK" if risk == "HIGH" else "BEST",
            )
        )

    rec_count = db.scalar(
        select(func.count()).select_from(Recommendation).where(Recommendation.organization_id == org.id)
    ) or 0
    if rec_count < 3:
        db.add(
            Recommendation(
                organization_id=org.id,
                scenario_id=scenarios[0].id,
                action="REALLOCATE_SUPPLIER_VOLUME",
                description="Перераспределить 14% объёма Supplier B на Supplier Alpha",
                effects_json='{"otif":{"before":0.79,"after":0.93},"stockout_risk":{"before":0.31,"after":0.09},"cost_delta":0.04}',
                semantic_status="RECOMMENDED",
            )
        )
        db.add(
            Recommendation(
                organization_id=org.id,
                scenario_id=scenarios[1].id,
                action="CHANGE_CARRIER",
                description="Переключить 8 рейсов с Carrier B на Carrier Vector",
                effects_json='{"otif":{"before":0.82,"after":0.91}}',
                semantic_status="ALTERNATIVE",
            )
        )
        db.add(
            Recommendation(
                organization_id=org.id,
                scenario_id=scenarios[0].id,
                action="INCREASE_SAFETY_STOCK",
                description="Поднять safety stock SKU-4000 на 15%",
                effects_json='{"stockout_risk":{"before":0.31,"after":0.12}}',
                semantic_status="OPTIONAL",
            )
        )

    if not db.scalars(select(ExceptionRule).where(ExceptionRule.organization_id == org.id)).first():
        db.add(
            ExceptionRule(
                organization_id=org.id,
                name="Vehicle stopped > 90 min",
                rule_type="STOP_DURATION",
                threshold_value=90,
                exception_type=ExceptionType.VEHICLE_STOP.value,
            )
        )
        db.add(
            ExceptionRule(
                organization_id=org.id,
                name="SLA breach probability > 80%",
                rule_type="SLA_RISK",
                threshold_value=80,
                exception_type=ExceptionType.ETA_RISK.value,
            )
        )


def _seed_shipments_exceptions(
    db: Session,
    org: Organization,
    master: dict,
    *,
    target_count: int = 56,
) -> None:
    suppliers: list[Supplier] = master["suppliers"]
    carriers: list[Carrier] = master["carriers"]
    nodes: list[NetworkNode] = master["nodes"]
    products: list[Product] = master["products"]
    now = datetime.now(timezone.utc)

    existing = db.scalar(
        select(func.count()).select_from(Shipment).where(Shipment.organization_id == org.id)
    ) or 0
    to_create = max(0, target_count - int(existing))

    created: list[Shipment] = []
    for i in range(to_create):
        idx = int(existing) + i
        status = SHIPMENT_STATUSES[idx % len(SHIPMENT_STATUSES)]
        risk = RISK_STATUSES[idx % len(RISK_STATUSES)]
        at_risk = risk in ("HIGH", "CRITICAL")
        shipment = Shipment(
            organization_id=org.id,
            external_ref=f"SH-{100 + idx:04d}",
            supplier_id=suppliers[idx % len(suppliers)].id,
            carrier_id=carriers[idx % len(carriers)].id,
            origin_id=nodes[idx % len(nodes)].id,
            destination_id=nodes[(idx + 1) % len(nodes)].id,
            status=status,
            planned_pickup_at=now - timedelta(hours=6),
            planned_delivery_at=now + timedelta(hours=2),
            forecast_eta=now + timedelta(hours=5 if at_risk else 2, minutes=25 if at_risk else 10),
            deviation_minutes=205 if at_risk else 10,
            sla_risk=0.92 if at_risk else 0.12,
            risk_status=risk,
        )
        db.add(shipment)
        created.append(shipment)
    db.flush()

    for i, shipment in enumerate(created):
        db.add(
            ShipmentItem(
                shipment_id=shipment.id,
                sku_id=products[i % len(products)].id,
                quantity=4800 if shipment.risk_status in ("HIGH", "CRITICAL") else 1200,
            )
        )

    # Guarantee portal-critical statuses on linked partners
    alpha = next((s for s in suppliers if s.name == "Supplier Alpha"), suppliers[0])
    vector = next((c for c in carriers if c.name == "Carrier Vector"), carriers[0])
    alpha_shipments = list(db.scalars(select(Shipment).where(Shipment.supplier_id == alpha.id)).all())
    vector_shipments = list(db.scalars(select(Shipment).where(Shipment.carrier_id == vector.id)).all())
    if alpha_shipments:
        alpha_shipments[0].status = "ACCEPTED"
        if len(alpha_shipments) > 1:
            alpha_shipments[1].status = "READY_FOR_PICKUP"
    if vector_shipments:
        vector_shipments[0].status = "ASSIGNED"
        if len(vector_shipments) > 1:
            vector_shipments[1].status = "ARRIVED"
        if len(vector_shipments) > 2:
            vector_shipments[2].status = "IN_TRANSIT"

    all_shipments = list(db.scalars(select(Shipment).where(Shipment.organization_id == org.id)).all())
    exc_count = db.scalar(
        select(func.count()).select_from(ScmException).where(ScmException.organization_id == org.id)
    ) or 0
    if exc_count < 10 and all_shipments:
        severities = ("CRITICAL", "HIGH", "MEDIUM", "LOW", "HIGH", "CRITICAL", "MEDIUM", "HIGH", "LOW", "CRITICAL")
        for i in range(10 - int(exc_count)):
            sh = all_shipments[i % len(all_shipments)]
            db.add(
                ScmException(
                    organization_id=org.id,
                    type=ExceptionType.ETA_RISK.value if i % 2 else ExceptionType.VEHICLE_STOP.value,
                    severity=severities[i],
                    reason=f"Demo exception #{i + 1} on {sh.external_ref}",
                    status="OPEN",
                    shipment_id=sh.id,
                    supplier_id=sh.supplier_id,
                    carrier_id=sh.carrier_id,
                    probability=0.5 + i * 0.04,
                    impact_json='{"sla":"HIGH"}',
                )
            )
        db.flush()

    inc_count = db.scalar(
        select(func.count()).select_from(Incident).where(Incident.organization_id == org.id)
    ) or 0
    exceptions = list(db.scalars(select(ScmException).where(ScmException.organization_id == org.id)).all())
    if inc_count < 5 and all_shipments:
        for i in range(5 - int(inc_count)):
            sh = all_shipments[i % len(all_shipments)]
            db.add(
                Incident(
                    organization_id=org.id,
                    title=f"Инцидент по {sh.external_ref}",
                    description="Demo incident for role/portal checks",
                    status=["OPEN", "IN_PROGRESS", "WAITING_PARTNER", "RESOLVED", "OPEN"][i],
                    exception_id=exceptions[i].id if i < len(exceptions) else None,
                    shipment_id=sh.id,
                )
            )


def _link_portal_partners(
    db: Session,
    customer: Organization,
    supplier_org: Organization,
    carrier_org: Organization,
) -> dict | None:
    suppliers = list(db.scalars(select(Supplier).where(Supplier.organization_id == customer.id)).all())
    carriers = list(db.scalars(select(Carrier).where(Carrier.organization_id == customer.id)).all())
    if not suppliers or not carriers:
        return None

    alpha = next((s for s in suppliers if "Alpha" in s.name or s.name == "Supplier A"), suppliers[0])
    vector = next((c for c in carriers if "Vector" in c.name or c.name == "Carrier A"), carriers[0])
    alpha.name = "Supplier Alpha"
    alpha.linked_org_id = supplier_org.id
    vector.name = "Carrier Vector"
    vector.linked_org_id = carrier_org.id

    nodes = list(db.scalars(select(NetworkNode).where(NetworkNode.organization_id == customer.id)).all())
    lanes = list(
        db.scalars(select(NetworkConnection).where(NetworkConnection.organization_id == customer.id)).all()
    )
    products = list(db.scalars(select(Product).where(Product.organization_id == customer.id)).all())
    warehouses = list(db.scalars(select(Warehouse).where(Warehouse.organization_id == customer.id)).all())
    return {
        "nodes": nodes,
        "lanes": lanes,
        "suppliers": suppliers,
        "carriers": carriers,
        "warehouses": warehouses,
        "products": products,
    }


def _ensure_products(db: Session, org: Organization, target: int = 30) -> list[Product]:
    products = list(db.scalars(select(Product).where(Product.organization_id == org.id)).all())
    existing_skus = {p.sku for p in products}
    i = 0
    while len(products) < target:
        sku = f"SKU-{4000 + i}"
        i += 1
        if sku in existing_skus:
            continue
        product = Product(
            organization_id=org.id,
            sku=sku,
            name=f"Product {sku}",
            product_group="Electronics" if i % 2 == 0 else "FMCG",
        )
        db.add(product)
        products.append(product)
        existing_skus.add(sku)
    db.flush()
    return products


def _ensure_master_volume(db: Session, org: Organization) -> dict:
    """Idempotent top-up so re-seed on existing DB reaches TZ demo volumes."""
    suppliers = list(db.scalars(select(Supplier).where(Supplier.organization_id == org.id)).all())
    extra_suppliers = [
        ("Supplier D", "Урал", "FMCG", 0.88, 48, "MEDIUM"),
        ("Supplier E", "Юг", "Electronics", 0.96, 15, "LOW"),
    ]
    names = {s.name for s in suppliers}
    for name, region, group, otif, risk, risk_status in extra_suppliers:
        if name in names or len(suppliers) >= 5:
            continue
        s = Supplier(
            organization_id=org.id,
            name=name,
            status="ACTIVE",
            region=region,
            product_group=group,
            otif=otif,
            average_lead_time_hours=72,
            incident_rate=0.05,
            supply_share=0.1,
            risk_score=risk,
            risk_status=risk_status,
        )
        db.add(s)
        suppliers.append(s)
    db.flush()

    carriers = list(db.scalars(select(Carrier).where(Carrier.organization_id == org.id)).all())
    if len(carriers) < 4 and not any(c.name == "Carrier D" for c in carriers):
        c = Carrier(
            organization_id=org.id,
            name="Carrier D",
            otif=0.91,
            eta_accuracy=0.90,
            average_delay_minutes=22,
            transit_time_hours=9,
            incident_rate=0.04,
            shipment_count=210,
            risk_score=28,
            risk_status="LOW",
        )
        db.add(c)
        carriers.append(c)
        db.flush()

    nodes = list(db.scalars(select(NetworkNode).where(NetworkNode.organization_id == org.id)).all())
    node_names = {n.name for n in nodes}
    for typ, name, lat, lng, cap in (
        ("WAREHOUSE", "Нижний Новгород", 56.33, 44.00, 45000),
        ("HUB", "Екатеринбург", 56.84, 60.60, 70000),
    ):
        if name in node_names or len(nodes) >= 5:
            continue
        node = NetworkNode(
            organization_id=org.id,
            type=typ,
            name=name,
            latitude=lat,
            longitude=lng,
            capacity=cap,
        )
        db.add(node)
        nodes.append(node)
    db.flush()

    warehouses = list(db.scalars(select(Warehouse).where(Warehouse.organization_id == org.id)).all())
    wh_names = {w.name for w in warehouses}
    for node in nodes:
        if node.name in wh_names:
            continue
        wh = Warehouse(organization_id=org.id, node_id=node.id, name=node.name, capacity=node.capacity)
        db.add(wh)
        warehouses.append(wh)
    db.flush()

    lanes = list(
        db.scalars(select(NetworkConnection).where(NetworkConnection.organization_id == org.id)).all()
    )
    if len(lanes) < 10 and len(nodes) >= 2:
        existing_pairs = {(ln.source_node_id, ln.target_node_id) for ln in lanes}
        for i, src in enumerate(nodes):
            if len(lanes) >= 10:
                break
            for j, dst in enumerate(nodes):
                if i == j or len(lanes) >= 10:
                    continue
                pair = (src.id, dst.id)
                if pair in existing_pairs:
                    continue
                lane = NetworkConnection(
                    organization_id=org.id,
                    source_node_id=src.id,
                    target_node_id=dst.id,
                    type="TRANSPORT_LANE",
                    planned_lead_time_minutes=600,
                    capacity=400,
                )
                db.add(lane)
                lanes.append(lane)
                existing_pairs.add(pair)
        db.flush()

    products = _ensure_products(db, org, 30)
    return {
        "nodes": nodes,
        "lanes": lanes,
        "suppliers": suppliers,
        "carriers": carriers,
        "warehouses": warehouses,
        "products": products,
    }


def seed_scm_demo(db: Session) -> None:
    seed_rbac(db)

    customer = _ensure_org(db, CUSTOMER_ORG_NAME, OrganizationType.CUSTOMER.value)
    supplier_org = _ensure_org(db, SUPPLIER_ORG_NAME, OrganizationType.SUPPLIER.value)
    carrier_org = _ensure_org(db, CARRIER_ORG_NAME, OrganizationType.CARRIER.value)

    seed_demo_accounts(db, customer, supplier_org, carrier_org)

    has_suppliers = db.scalars(select(Supplier).where(Supplier.organization_id == customer.id)).first()
    if not has_suppliers:
        master = _seed_master_data(db, customer)
        _seed_plans_scenarios(db, customer, master)
        master["suppliers"][0].linked_org_id = supplier_org.id
        master["carriers"][0].linked_org_id = carrier_org.id
        _seed_shipments_exceptions(db, customer, master, target_count=56)
        db.commit()
        return

    master = _ensure_master_volume(db, customer)
    _link_portal_partners(db, customer, supplier_org, carrier_org)
    # refresh after rename/link
    master["suppliers"] = list(db.scalars(select(Supplier).where(Supplier.organization_id == customer.id)).all())
    master["carriers"] = list(db.scalars(select(Carrier).where(Carrier.organization_id == customer.id)).all())
    _seed_plans_scenarios(db, customer, master)
    _seed_shipments_exceptions(db, customer, master, target_count=56)
    db.commit()


# Back-compat alias used by older call sites / docs
def seed_portal_partners(db: Session) -> None:
    customer = db.scalars(select(Organization).where(Organization.name == CUSTOMER_ORG_NAME)).first()
    if customer is None:
        return
    supplier_org = _ensure_org(db, SUPPLIER_ORG_NAME, OrganizationType.SUPPLIER.value)
    carrier_org = _ensure_org(db, CARRIER_ORG_NAME, OrganizationType.CARRIER.value)
    seed_demo_accounts(db, customer, supplier_org, carrier_org)
    _link_portal_partners(db, customer, supplier_org, carrier_org)
    db.commit()
