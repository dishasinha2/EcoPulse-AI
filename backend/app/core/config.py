from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=None, extra="ignore")

    app_name: str = "EcoPulse AI"
    environment: str = "production"

    redis_host: str = "redis"
    redis_port: int = 6379
    redis_url: str | None = None

    db_host: str = "db"
    db_port: int = 5432
    db_name: str = "ecopulse"
    db_user: str = "ecopulse"
    db_password: str = "ecopulse"
    database_url: str | None = None

    electricitymaps_token: str | None = None
    carbon_region: str = "US-CAL-CISO"
    carbon_cache_ttl_seconds: int = 60

    scheduler_interval_seconds: int = 30
    api_rate_limit_per_minute: int = 120
    allowed_origins: str = "*"

    @property
    def resolved_redis_url(self) -> str:
        if self.redis_url:
            return self.redis_url
        return f"redis://{self.redis_host}:{self.redis_port}/0"

    @property
    def resolved_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        return (
            f"postgresql+asyncpg://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def cors_origins(self) -> list[str]:
        raw = self.allowed_origins.strip()
        if not raw:
            return ["*"]
        return [part.strip() for part in raw.split(",") if part.strip()]


settings = Settings()

