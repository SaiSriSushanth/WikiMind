from pathlib import Path
from pydantic_settings import BaseSettings

ROOT_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str
    database_url: str

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080

    openai_api_key: str
    redis_url: str
    resend_api_key: str

    environment: str = "development"
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = str(ROOT_DIR / ".env")
        env_file_encoding = "utf-8"


settings = Settings()
