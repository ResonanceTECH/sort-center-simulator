from fastapi import APIRouter

from app.api.v1 import auth, catalog, health, membership, projects, ws

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(catalog.router)
api_router.include_router(projects.router)
api_router.include_router(membership.router)
api_router.include_router(ws.router)
