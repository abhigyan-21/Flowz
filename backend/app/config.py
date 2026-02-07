from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Database
    DATABASE_URL: Optional[str] = None
    
    # CDN/Storage
    CDN_BASE_URL: str = "https://cdn.yourapp.com"
    
    # Mock Data
    MOCK_MODE: bool = True
    AUTO_REFRESH: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
