from __future__ import annotations

from pydantic import BaseModel


class CarbonResponse(BaseModel):
    region: str
    carbon_intensity: int
    source: str  # electricitymaps|simulated|cache

