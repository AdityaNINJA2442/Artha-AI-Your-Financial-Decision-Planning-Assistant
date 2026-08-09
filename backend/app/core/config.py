import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Artha AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "artha_ai_super_secret_jwt_key_change_in_production_32bytes"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # PostgreSQL Database URL
    DATABASE_URL: str = "postgresql://artha_user:artha_password@localhost:5432/artha_db"

    # API Keys
    AI_API_KEY: str = ""
    AI_MODEL_NAME: str = "gemini-1.5-flash"
    MARKET_API_KEY: str = ""
    OCR_API_KEY: str = ""

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
