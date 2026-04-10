from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class JobDecisionLog(Base):
    __tablename__ = "job_decision_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    job_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    carbon_intensity: Mapped[int] = mapped_column(Integer, nullable=False)
    threshold: Mapped[int] = mapped_column(Integer, nullable=False)
    action: Mapped[str] = mapped_column(String(16), nullable=False)  # pause/resume/noop
    deadline_mode: Mapped[bool] = mapped_column(nullable=False, default=False)
    estimated_cost_saved_usd: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    estimated_co2_saved_g: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

