from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SavingsEstimate:
    estimated_cost_saved_usd: int
    estimated_co2_saved_g: int


def estimate_savings(
    *,
    action: str,
    carbon_intensity: int,
    threshold: int,
    interval_seconds: int,
) -> SavingsEstimate:
    """
    Hackathon-friendly estimation.
    - Cost saved: assume 0.002 USD per GPU-second while paused
    - CO2 saved: intensity diff (gCO2/kWh) * assumed power draw * time
    """
    if action != "pause":
        return SavingsEstimate(estimated_cost_saved_usd=0, estimated_co2_saved_g=0)

    assumed_usd_per_second = 0.002
    assumed_kw = 0.5  # single-GPU-ish placeholder
    hours = interval_seconds / 3600.0
    kwh = assumed_kw * hours
    delta = max(0, carbon_intensity - threshold)
    co2_saved_g = int(delta * kwh)
    cost_saved_usd = int(assumed_usd_per_second * interval_seconds)
    return SavingsEstimate(estimated_cost_saved_usd=cost_saved_usd, estimated_co2_saved_g=co2_saved_g)

