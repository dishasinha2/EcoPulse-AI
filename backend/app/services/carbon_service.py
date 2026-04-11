from __future__ import annotations

import logging
import random

import httpx

from app.core.config import settings
from app.core.redis import redis_client


logger = logging.getLogger("ecopulse.carbon")


class CarbonService:
    CACHE_KEY = "carbon:intensity:latest"

    async def get_carbon_intensity(self) -> tuple[int, str]:
        """
        Returns (carbon_intensity, source).
        Uses Redis caching to avoid hammering upstream API.
        """
        cached = await redis_client.get(self.CACHE_KEY)
        if cached is not None:
            logger.debug("carbon_cache_hit value=%s", cached)
            return int(cached), "cache"

        intensity: int | None = None
        source: str = "simulated"

        token = (settings.electricitymaps_token or "").strip()
        if token:
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.get(
                        "https://api.electricitymap.org/v3/carbon-intensity/latest",
                        headers={"auth-token": token},
                        params={"zone": settings.carbon_region},
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    # Electricity Maps returns an object with `carbonIntensity` at top-level for this endpoint.
                    raw_intensity = data.get("carbonIntensity")
                    if raw_intensity is not None:
                        intensity = int(raw_intensity)
                    source = "electricitymaps"
            except Exception as exc:
                logger.warning("electricitymaps_fetch_failed error=%s", exc)
                intensity = None

        if intensity is None:
            # Simulate a somewhat realistic range.
            intensity = random.randint(50, 450)
            source = "simulated"
            logger.info("carbon_simulated value=%s", intensity)

        await redis_client.set(self.CACHE_KEY, str(intensity), ex=settings.carbon_cache_ttl_seconds)
        return intensity, source

