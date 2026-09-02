import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.database import Base, SessionLocal, engine
from app.db.seed import seed_demo_project

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if os.environ.get("SKIP_DB_STARTUP") != "1":
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_demo_project(db)
        finally:
            db.close()
    yield


app = FastAPI(
    title="Sort Center Simulator API",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Sort Center Simulator API"}
