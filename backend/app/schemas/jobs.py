from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


JobStatus = Literal["running", "paused"]


class StartJobRequest(BaseModel):
    job_id: str = Field(min_length=1, max_length=128)
    carbon_threshold: int = Field(ge=0, le=2000)
    deadline_at: datetime | None = None


class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    carbon_threshold: int
    deadline_at: datetime | None = None


class DecisionRequest(BaseModel):
    carbon_intensity: int | None = Field(default=None, ge=0, le=3000)


class DecisionResponse(BaseModel):
    job_id: str
    status: JobStatus
    carbon_intensity: int
    threshold: int
    action: Literal["pause", "resume", "noop"]
    deadline_mode: bool
    estimated_cost_saved_usd: int
    estimated_co2_saved_g: int

