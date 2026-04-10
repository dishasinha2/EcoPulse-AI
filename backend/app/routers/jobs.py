from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import APIRouter, HTTPException, Request, status

from app.core.config import settings
from app.schemas.jobs import (
    DecisionRequest,
    DecisionResponse,
    JobStatusResponse,
    StartJobRequest,
)
from app.services.decision_service import DecisionService
from app.services.job_state_service import JobStateService


router = APIRouter(prefix="/jobs", tags=["jobs"])

_rate_buckets: dict[str, deque[float]] = defaultdict(deque)


def _check_rate_limit(request: Request) -> None:
    limit = max(1, int(settings.api_rate_limit_per_minute))
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    bucket = _rate_buckets[ip]
    cutoff = now - 60.0
    while bucket and bucket[0] < cutoff:
        bucket.popleft()
    if len(bucket) >= limit:
        raise HTTPException(status_code=429, detail="rate_limited")
    bucket.append(now)


@router.post("/start", response_model=dict)
async def start_job(req: StartJobRequest, request: Request):
    _check_rate_limit(request)
    svc = JobStateService()
    await svc.start_job(job_id=req.job_id, threshold=req.carbon_threshold, deadline_at=req.deadline_at)
    return {"status": "started", "job_id": req.job_id}


@router.get("/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str, request: Request):
    _check_rate_limit(request)
    svc = JobStateService()
    status_val = await svc.get_status(job_id=job_id)
    threshold = await svc.get_threshold(job_id=job_id)
    deadline_at = await svc.get_deadline(job_id=job_id)
    if status_val is None or threshold is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="job_not_found")
    if status_val not in ("running", "paused"):
        status_val = "paused"
    return JobStatusResponse(job_id=job_id, status=status_val, carbon_threshold=threshold, deadline_at=deadline_at)


@router.post("/{job_id}/decision", response_model=DecisionResponse)
async def decision_engine(job_id: str, req: DecisionRequest, request: Request):
    _check_rate_limit(request)
    svc = DecisionService()
    try:
        result = await svc.decide_and_apply(job_id=job_id, carbon_override=req.carbon_intensity)
        return DecisionResponse(**result)
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="job_not_found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"decision_failed: {e}")

