from __future__ import annotations

from datetime import datetime

from app.core.redis import redis_client


class JobStateService:
    def _status_key(self, job_id: str) -> str:
        return f"job_status:{job_id}"

    def _threshold_key(self, job_id: str) -> str:
        return f"job_threshold:{job_id}"

    def _deadline_key(self, job_id: str) -> str:
        return f"job_deadline:{job_id}"

    def _jobs_index_key(self) -> str:
        return "jobs:index"

    async def start_job(self, *, job_id: str, threshold: int, deadline_at: datetime | None) -> None:
        pipe = redis_client.pipeline()
        pipe.set(self._status_key(job_id), "running")
        pipe.set(self._threshold_key(job_id), str(threshold))
        if deadline_at is not None:
            pipe.set(self._deadline_key(job_id), deadline_at.isoformat())
        else:
            pipe.delete(self._deadline_key(job_id))
        pipe.sadd(self._jobs_index_key(), job_id)
        await pipe.execute()

    async def get_status(self, *, job_id: str) -> str | None:
        return await redis_client.get(self._status_key(job_id))

    async def set_status(self, *, job_id: str, status: str) -> None:
        await redis_client.set(self._status_key(job_id), status)

    async def get_threshold(self, *, job_id: str) -> int | None:
        raw = await redis_client.get(self._threshold_key(job_id))
        return int(raw) if raw is not None else None

    async def get_deadline(self, *, job_id: str) -> datetime | None:
        raw = await redis_client.get(self._deadline_key(job_id))
        if raw is None:
            return None
        try:
            return datetime.fromisoformat(raw)
        except Exception:
            return None

    async def list_job_ids(self) -> list[str]:
        ids = await redis_client.smembers(self._jobs_index_key())
        return sorted(ids)

