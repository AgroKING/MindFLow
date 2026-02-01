from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Application
    app_name: str = "MindFlow API"
    debug: bool = False
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"

    # Database
    database_url: str = "postgresql+asyncpg://mindflow:password@localhost:5432/mindflow"
    db_pool_size: int = 5
    db_max_overflow: int = 10
    db_echo: bool = False

    # Redis (for future rate limiting)
    redis_url: str = "redis://localhost:6379"

    # JWT Auth
    jwt_secret: str = "CHANGE_ME_IN_PRODUCTION"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30

    # Gemini AI (used by Agent 3)
    gemini_api_key: str = ""

    # Encryption key for sensitive data
    encryption_key: str = "CHANGE_ME_32_BYTE_KEY_HERE_1234"

    # CORS
    allowed_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
