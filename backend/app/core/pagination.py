from __future__ import annotations

from typing import Generic, Optional, TypeVar

from pydantic import BaseModel, Field
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

T = TypeVar("T")


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=50, ge=1, le=200)
    sort: Optional[str] = None
    order: str = Field(default="desc", pattern="^(asc|desc)$")


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    pagination: PaginationMeta


def paginate_query(
    db: Session,
    stmt: Select,
    *,
    page: int = 1,
    page_size: int = 50,
) -> tuple[list, PaginationMeta]:
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    pages = max(1, (total + page_size - 1) // page_size)
    offset = (page - 1) * page_size
    items = list(db.scalars(stmt.offset(offset).limit(page_size)).all())
    meta = PaginationMeta(page=page, page_size=page_size, total=total, pages=pages)
    return items, meta
