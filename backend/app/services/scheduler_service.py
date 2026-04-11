from __future__ import annotations

import asyncio
import contextlib
import logging

from app.core.config import settings
from app.services.decision_service import DecisionService
from app.services.job_state_service import JobStateService


logger = logging.getLogger("ecopulse.scheduler")


class SchedulerService:
    def __init__(self) -> None:
        self._task: asyncio.Task | None = None
        self._stop = asyncio.Event()
        self._state = JobStateService()
        self._decision = DecisionService()

    async def start(self) -> None:
        if self._task is not None:
            return
        self._stop.clear()
        self._task = asyncio.create_task(self._run_loop(), name="ecopulse-scheduler")

    async def stop(self) -> None:
        if self._task is None:
            return
        self._stop.set()
        self._task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await self._task
        self._task = None

    async def _run_loop(self) -> None:
        while not self._stop.is_set():
            try:
                job_ids = await self._state.list_job_ids()
                for job_id in job_ids:
                    await self._run_decision_with_retry(job_id)
            except Exception as exc:
                logger.exception("scheduler_loop_error error=%s", exc)
            finally:
                await asyncio.sleep(settings.scheduler_interval_seconds)

    async def _run_decision_with_retry(self, job_id: str) -> None:
        max_attempts = 3
        backoff = 0.5
        for attempt in range(1, max_attempts + 1):
            try:
                result = await self._decision.decide_and_apply(job_id=job_id)
                logger.info(
                    "scheduler_decision job_id=%s action=%s carbon=%s",
                    result["job_id"],
                    result["action"],
                    result["carbon_intensity"],
                )
                return
            except Exception as exc:
                logger.warning(
                    "scheduler_decision_retry job_id=%s attempt=%s error=%s",
                    job_id,
                    attempt,
                    exc,
                )
                if attempt == max_attempts:
                    logger.error("scheduler_decision_failed job_id=%s", job_id)
                    return
                await asyncio.sleep(backoff)
                backoff *= 2

