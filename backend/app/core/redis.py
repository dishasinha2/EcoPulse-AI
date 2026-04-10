from __future__ import annotations

from redis.asyncio import Redis

from app.core.config import settings


redis_client = Redis.from_url(settings.resolved_redis_url, decode_responses=True)


async def ping_redis() -> bool:
    return bool(await redis_client.ping())

