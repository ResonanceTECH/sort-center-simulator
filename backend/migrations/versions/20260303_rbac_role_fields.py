"""RBAC role fields + PLATFORM organization type.

Revision ID: 20260303_rbac_role_fields
Revises:
Create Date: 2026-03-03

Adds Role.description / is_system / organization_id for custom org roles.
Documents Organization.type values including PLATFORM (string column — no PG enum).
Backfills existing system roles (AppRole codes) as is_system=True.
"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260303_rbac_role_fields"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SYSTEM_ROLE_CODES = (
    "ADMIN",
    "SUPPLY_CHAIN_MANAGER",
    "SUPPLY_PLANNER",
    "LOGISTICS_MANAGER",
    "ANALYST",
    "SUPPLIER",
    "CARRIER",
)

SYSTEM_ROLE_META = {
    "ADMIN": ("Администратор", "Управление пользователями, ролями, организациями и аудитом"),
    "SUPPLY_CHAIN_MANAGER": (
        "Менеджер цепочки поставок",
        "Стратегия, планирование, исполнение и сценарии",
    ),
    "SUPPLY_PLANNER": ("Планировщик", "Прогнозы и планы без operational approve/apply"),
    "LOGISTICS_MANAGER": ("Логист", "Транспорт, поставки, отклонения и инциденты"),
    "ANALYST": ("Аналитик", "Аналитика и сценарии без изменения operational source of truth"),
    "SUPPLIER": ("Поставщик", "Портал поставщика — только данные своей организации"),
    "CARRIER": ("Перевозчик", "Портал перевозчика — только назначенные перевозки"),
}


def upgrade() -> None:
    op.add_column("roles", sa.Column("description", sa.Text(), nullable=True))
    op.add_column(
        "roles",
        sa.Column("is_system", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column(
        "roles",
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_roles_organization_id",
        "roles",
        "organizations",
        ["organization_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_index("ix_roles_organization_id", "roles", ["organization_id"])

    # Custom roles: unique name within an organization (system roles have NULL org).
    op.create_index(
        "uq_roles_organization_id_name",
        "roles",
        ["organization_id", "name"],
        unique=True,
        postgresql_where=sa.text("organization_id IS NOT NULL"),
    )

    conn = op.get_bind()
    for code in SYSTEM_ROLE_CODES:
        name, description = SYSTEM_ROLE_META[code]
        conn.execute(
            sa.text(
                """
                UPDATE roles
                SET is_system = true,
                    organization_id = NULL,
                    name = :name,
                    description = :description
                WHERE code = :code
                """
            ),
            {"code": code, "name": name, "description": description},
        )

    # Normalize legacy org type if any rows still use WAREHOUSE_OPERATOR.
    conn.execute(
        sa.text(
            """
            UPDATE organizations
            SET type = 'PLATFORM'
            WHERE type = 'WAREHOUSE_OPERATOR'
            """
        )
    )


def downgrade() -> None:
    op.drop_index("uq_roles_organization_id_name", table_name="roles")
    op.drop_index("ix_roles_organization_id", table_name="roles")
    op.drop_constraint("fk_roles_organization_id", "roles", type_="foreignkey")
    op.drop_column("roles", "organization_id")
    op.drop_column("roles", "is_system")
    op.drop_column("roles", "description")
