import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.database import Base, SessionLocal, engine
from app.core.errors import AppError, app_error_handler, http_exception_handler
from app.db.seed import seed_demo_project
from app.db.scm_seed import seed_scm_demo
from fastapi import HTTPException

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if os.environ.get("SKIP_DB_STARTUP") != "1":
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_demo_project(db)
            seed_scm_demo(db)
        finally:
            db.close()
    yield


app = FastAPI(
    title="SCM Control Tower API",
    description="B2B Supply Chain Management Platform — Strategy → Planning → Execution",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(HTTPException, http_exception_handler)

app.include_router(api_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "SCM Control Tower API", "version": "1.0.0", "docs": "/docs"}
