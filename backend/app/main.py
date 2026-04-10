from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.core.logging_config import configure_logging
from app.routers import carbon, health, jobs, ws
from app.services.scheduler_service import SchedulerService


scheduler = SchedulerService()
configure_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await scheduler.start()
    try:
        yield
    finally:
        await scheduler.stop()


app = FastAPI(title="EcoPulse AI Backend", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(carbon.router)
app.include_router(jobs.router)
app.include_router(ws.router)


@app.get("/")
async def root():
    return {"message": "EcoPulse AI backend is running"}

