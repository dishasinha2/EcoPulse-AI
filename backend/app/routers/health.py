from __future__ import annotations

from fastapi import APIRouter

from app.core.database import ping_db
from app.core.redis import ping_redis


router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    redis_ok = await ping_redis()
    db_ok = await ping_db()
    overall = "ok" if redis_ok and db_ok else "degraded"
    return {"status": overall, "redis": redis_ok, "db": db_ok}


@router.get("/redis-health")
async def redis_health():
    return {"redis": await ping_redis()}


@router.get("/db-health")
async def db_health():
    return {"db": await ping_db()}

