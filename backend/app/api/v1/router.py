from fastapi import APIRouter

from app.api.v1 import (
    analytics,
    carriers,
    catalog,
    exceptions,
    health,
    incidents,
    membership,
    network,
    notifications,
    planning,
    projects,
    realtime,
    scm_auth,
    shipments,
    suppliers,
    users,
    ws,
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(scm_auth.router)
api_router.include_router(catalog.router)
api_router.include_router(projects.router)
api_router.include_router(membership.router)
api_router.include_router(ws.router)

# SCM Platform
api_router.include_router(network.router)
api_router.include_router(suppliers.router)
api_router.include_router(carriers.router)
api_router.include_router(shipments.router)
api_router.include_router(exceptions.router)
api_router.include_router(incidents.router)
api_router.include_router(analytics.router)
api_router.include_router(planning.router)
api_router.include_router(planning.scenarios_router)
api_router.include_router(notifications.router)
api_router.include_router(realtime.router)
api_router.include_router(users.router)
