from fastapi import APIRouter

from app.core.database import check_db_connection

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "database": check_db_connection(),
    }
