from __future__ import annotations

import logging

from sqlalchemy import insert

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.job_log import JobDecisionLog
from app.services.carbon_service import CarbonService
from app.services.job_state_service import JobStateService
from app.utils.metrics import estimate_savings
from app.utils.time import seconds_until


logger = logging.getLogger("ecopulse.decision")


class DecisionService:
    def __init__(self) -> None:
        self.carbon = CarbonService()
        self.state = JobStateService()

    async def decide_and_apply(self, *, job_id: str, carbon_override: int | None = None) -> dict:
        status = await self.state.get_status(job_id=job_id)
        threshold = await self.state.get_threshold(job_id=job_id)
        if status is None or threshold is None:
            raise KeyError("job_not_found")

        deadline_at = await self.state.get_deadline(job_id=job_id)
        deadline_mode = False
        if deadline_at is not None and seconds_until(deadline_at) <= 15 * 60:
            deadline_mode = True

        if carbon_override is None:
            carbon_intensity, _source = await self.carbon.get_carbon_intensity()
        else:
            carbon_intensity = int(carbon_override)

        if deadline_mode:
            desired_status = "running"
        else:
            desired_status = "paused" if carbon_intensity > threshold else "running"

        action: str
        if desired_status == status:
            action = "noop"
        elif desired_status == "paused":
            action = "pause"
        else:
            action = "resume"

        if action in ("pause", "resume"):
            await self.state.set_status(job_id=job_id, status=desired_status)

        savings = estimate_savings(
            action=action,
            carbon_intensity=carbon_intensity,
            threshold=threshold,
            interval_seconds=settings.scheduler_interval_seconds,
        )

        async with AsyncSessionLocal() as session:
            await session.execute(
                insert(JobDecisionLog).values(
                    job_id=job_id,
                    carbon_intensity=carbon_intensity,
                    threshold=threshold,
                    action=action,
                    deadline_mode=deadline_mode,
                    estimated_cost_saved_usd=savings.estimated_cost_saved_usd,
                    estimated_co2_saved_g=savings.estimated_co2_saved_g,
                )
            )
            await session.commit()

        logger.info(
            "job_decision job_id=%s action=%s carbon=%s threshold=%s deadline_mode=%s",
            job_id,
            action,
            carbon_intensity,
            threshold,
            deadline_mode,
        )

        return {
            "job_id": job_id,
            "status": desired_status,
            "carbon_intensity": carbon_intensity,
            "threshold": threshold,
            "action": action,
            "deadline_mode": deadline_mode,
            "estimated_cost_saved_usd": savings.estimated_cost_saved_usd,
            "estimated_co2_saved_g": savings.estimated_co2_saved_g,
        }

