from __future__ import annotations

from fastapi import APIRouter

from app.schemas.carbon import CarbonResponse
from app.services.carbon_service import CarbonService
from app.core.config import settings


router = APIRouter(prefix="/carbon", tags=["carbon"])


@router.get("", response_model=CarbonResponse)
async def get_carbon():
    svc = CarbonService()
    intensity, source = await svc.get_carbon_intensity()
    return CarbonResponse(region=settings.carbon_region, carbon_intensity=intensity, source=source)

