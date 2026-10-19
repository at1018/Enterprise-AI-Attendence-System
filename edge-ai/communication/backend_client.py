"""
Backend Communication Client
Handles HTTP communication with the Node.js backend
"""

import aiohttp
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime

class BackendClient:
    """HTTP client for communicating with the backend API"""
    
    def __init__(self, api_url: str, auth_token: str, timeout: int, logger):
        """
        Initialize backend client
        
        Args:
            api_url: Backend API base URL
            auth_token: Authentication token
            timeout: Request timeout in seconds
            logger: Logger instance
        """
        self.api_url = api_url.rstrip('/')
        self.auth_token = auth_token
        self.timeout = timeout
        self.logger = logger
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session"""
        if self.session is None or self.session.closed:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            timeout = aiohttp.ClientTimeout(total=self.timeout)
            self.session = aiohttp.ClientSession(headers=headers, timeout=timeout)
        return self.session
    
    async def close(self):
        """Close HTTP session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make HTTP request to backend
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint
            data: Request body data
            
        Returns:
            Response data
        """
        session = await self._get_session()
        url = f"{self.api_url}{endpoint}"
        
        try:
            async with session.request(method, url, json=data) as response:
                response.raise_for_status()
                return await response.json()
                
        except aiohttp.ClientError as e:
            self.logger.error(f"HTTP request failed: {e}")
            raise
        except Exception as e:
            self.logger.error(f"Request error: {e}")
            raise
    
    async def register_device(self, device_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register device with backend
        
        Args:
            device_info: Device information
            
        Returns:
            Registration response
        """
        self.logger.info(f"Registering device {device_info.get('deviceId')}")
        
        try:
            response = await self._request("POST", "/devices/register", device_info)
            self.logger.info("Device registered successfully")
            return response
            
        except Exception as e:
            self.logger.error(f"Device registration failed: {e}")
            raise
    
    async def send_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send event to backend
        
        Args:
            event: Event data
            
        Returns:
            Response from backend
        """
        self.logger.debug(f"Sending event {event.get('eventId')} to backend")
        
        try:
            response = await self._request("POST", "/events", event)
            self.logger.debug(f"Event {event.get('eventId')} sent successfully")
            return response
            
        except Exception as e:
            self.logger.error(f"Failed to send event {event.get('eventId')}: {e}")
            raise
    
    async def get_cameras(self, tenant_id: str) -> list:
        """
        Get cameras for tenant from backend
        
        Args:
            tenant_id: Tenant ID
            
        Returns:
            List of cameras
        """
        self.logger.debug(f"Fetching cameras for tenant {tenant_id}")
        
        try:
            response = await self._request("GET", f"/cameras?tenantId={tenant_id}")
            return response.get("cameras", [])
            
        except Exception as e:
            self.logger.error(f"Failed to fetch cameras: {e}")
            raise
    
    async def health_check(self) -> bool:
        """
        Check backend health
        
        Returns:
            True if backend is healthy
        """
        try:
            response = await self._request("GET", "/health")
            return response.get("status") == "ok"
            
        except Exception as e:
            self.logger.error(f"Health check failed: {e}")
            return False
