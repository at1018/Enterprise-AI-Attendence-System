"""
Configuration Management for Edge Agent
Handles loading and validation of configuration settings
"""

import os
from typing import Optional
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class BackendConfig(BaseModel):
    """Backend API configuration"""
    api_url: str = Field(default="http://localhost:3000/api/v1")
    timeout: int = Field(default=30)
    retry_attempts: int = Field(default=3)
    retry_delay: int = Field(default=5)  # seconds

class DeviceConfig(BaseModel):
    """Device identity configuration"""
    device_id: str = Field(default="edge-device-001")
    device_name: str = Field(default="Default Edge Device")
    tenant_id: Optional[str] = None
    auth_token: Optional[str] = None

class QueueConfig(BaseModel):
    """Offline queue configuration"""
    queue_file: str = Field(default="edge_queue.db")
    max_queue_size: int = Field(default=10000)
    sync_interval: int = Field(default=60)  # seconds
    batch_size: int = Field(default=50)

class LoggingConfig(BaseModel):
    """Logging configuration"""
    log_level: str = Field(default="INFO")
    log_file: str = Field(default="edge_agent.log")
    log_format: str = Field(default="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

class EdgeAgentConfig(BaseSettings):
    """Complete Edge Agent configuration"""
    
    # Sub-configurations
    backend: BackendConfig = Field(default_factory=BackendConfig)
    device: DeviceConfig = Field(default_factory=DeviceConfig)
    queue: QueueConfig = Field(default_factory=QueueConfig)
    logging: LoggingConfig = Field(default_factory=LoggingConfig)
    
    # Direct environment overrides
    log_level: str = Field(default="INFO")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

def load_config() -> EdgeAgentConfig:
    """Load and validate configuration from environment variables"""
    return EdgeAgentConfig()

def validate_config(config: EdgeAgentConfig) -> bool:
    """Validate that required configuration is present"""
    
    if not config.device.tenant_id:
        raise ValueError("TENANT_ID environment variable is required")
    
    if not config.device.auth_token:
        raise ValueError("AUTH_TOKEN environment variable is required")
    
    return True
