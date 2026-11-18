"""
VERITAS AI - Centralized Application Configuration
Provides strongly-typed settings using Pydantic Settings.
"""

from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration settings."""
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Core App
    APP_NAME: str = "VERITAS AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
    ]

    # Security & SSRF Defense
    ALLOW_PRIVATE_IPS: bool = False
    HTTP_MAX_REDIRECTS: int = 3
    HTTP_MAX_RESPONSE_BYTES: int = 1_048_576  # 1MB limit
    RATE_LIMIT_PER_MINUTE: int = 60
    REQUEST_TIMEOUT_SECONDS: float = 15.0

    # Search & Concurrency
    TAVILY_API_KEY: str = Field(default="", description="Tavily API key")
    SEARCH_PROVIDER: str = "hybrid"  # hybrid, tavily, direct, mock
    MAX_CONCURRENT_SEARCHES: int = 4
    MAX_SEARCH_RESULTS_DEFAULT: int = 10
    MAX_RESEARCH_DEPTH: int = 3

    # LLM Providers
    GEMINI_API_KEY: str = Field(default="", description="Gemini API Key")
    OPENAI_API_KEY: str = Field(default="", description="OpenAI API Key")
    DEFAULT_MODEL: str = "gemini-1.5-flash"


settings = Settings()
