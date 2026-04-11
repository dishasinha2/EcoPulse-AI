from __future__ import annotations

from datetime import datetime, timezone


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def seconds_until(dt: datetime) -> int:
    now = utcnow()
    if dt.tzinfo is None:
        # Treat naive as UTC.
        dt = dt.replace(tzinfo=timezone.utc)
    return int((dt - now).total_seconds())

