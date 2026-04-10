from __future__ import annotations

import asyncio
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.redis import redis_client


router = APIRouter(tags=["ws"])


@router.websocket("/ws/jobs/{job_id}")
async def job_ws(websocket: WebSocket, job_id: str):
    await websocket.accept()
    status_key = f"job_status:{job_id}"

    try:
        while True:
            status_val = await redis_client.get(status_key)
            await websocket.send_json({"job_id": job_id, "status": status_val or "unknown"})
            await asyncio.sleep(2.0)
    except WebSocketDisconnect:
        return
    except Exception as e:
        # best-effort: close without leaking internals to clients
        try:
            await websocket.send_json({"error": "ws_failed", "detail": str(e)[:200]})
        finally:
            await websocket.close()

