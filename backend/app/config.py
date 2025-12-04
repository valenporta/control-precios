from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from pydantic import Field

load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    prices_folder_path: Path = Field(
        default_factory=lambda: Path(__file__).resolve().parent.parent.parent / "sample_data"
    )
    allowed_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173", "http://localhost:3000"])

    class Config:
        env_prefix = ""
        env_file = ".env"
        case_sensitive = False


def get_settings() -> Settings:
    return Settings()
