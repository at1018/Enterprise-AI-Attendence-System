"""
Edge Agent Main Application
Orchestrates all Edge Agent components
"""

import asyncio
import uuid
from datetime import datetime
from typing import Optional
from configuration.config import EdgeAgentConfig, validate_config
from logging.logger import get_logger
from communication.backend_client import BackendClient
from storage.event_queue import EventQueue
from camera.camera_manager import CameraManager

class EdgeAgent:
    """Main Edge Agent class that orchestrates all components"""
    
    def __init__(self, config: EdgeAgentConfig, logger):
        """
        Initialize Edge Agent
        
        Args:
            config: Edge Agent configuration
            logger: Logger instance
        """
        self.config = config
        self.logger = logger
        self.running = False
        
        # Initialize components
        self.backend_client: Optional[BackendClient] = None
        self.event_queue: Optional[EventQueue] = None
        self.camera_manager: Optional[CameraManager] = None
        
        # Device identity
        self.device_id = config.device.device_id
        self.tenant_id = config.device.tenant_id
        self.auth_token = config.device.auth_token
        
    async def start(self):
        """Start the Edge Agent and all its components"""
        self.logger.info(f"Starting Edge Agent {self.device_id} for tenant {self.tenant_id}")
        
        # Validate configuration
        try:
            validate_config(self.config)
            self.logger.info("Configuration validated successfully")
        except ValueError as e:
            self.logger.error(f"Configuration validation failed: {e}")
            raise
        
        # Initialize backend client
        self.backend_client = BackendClient(
            api_url=self.config.backend.api_url,
            auth_token=self.auth_token,
            timeout=self.config.backend.timeout,
            logger=self.logger
        )
        
        # Initialize event queue
        self.event_queue = EventQueue(
            queue_file=self.config.queue.queue_file,
            max_size=self.config.queue.max_queue_size,
            logger=self.logger
        )
        
        # Initialize camera manager
        self.camera_manager = CameraManager(
            backend_client=self.backend_client,
            event_queue=self.event_queue,
            logger=self.logger
        )
        
        # Authenticate with backend
        await self._authenticate()
        
        # Start background tasks
        self.running = True
        self.logger.info("Edge Agent started successfully")
        
        # Start sync task
        asyncio.create_task(self._sync_loop())
        
    async def stop(self):
        """Stop the Edge Agent and cleanup resources"""
        self.logger.info("Stopping Edge Agent...")
        self.running = False
        
        if self.camera_manager:
            await self.camera_manager.stop()
        
        if self.event_queue:
            self.event_queue.close()
        
        self.logger.info("Edge Agent stopped")
    
    async def _authenticate(self):
        """Authenticate with backend and register device"""
        self.logger.info("Authenticating with backend...")
        
        try:
            # Register device with backend
            device_info = await self.backend_client.register_device({
                "deviceId": self.device_id,
                "deviceName": self.config.device.device_name,
                "tenantId": self.tenant_id,
                "status": "ONLINE"
            })
            
            self.logger.info(f"Device registered successfully: {device_info}")
            
        except Exception as e:
            self.logger.error(f"Authentication failed: {e}")
            raise
    
    async def _sync_loop(self):
        """Background task to sync queued events with backend"""
        while self.running:
            try:
                await asyncio.sleep(self.config.queue.sync_interval)
                
                if not self.running:
                    break
                
                await self._sync_events()
                
            except Exception as e:
                self.logger.error(f"Sync loop error: {e}")
    
    async def _sync_events(self):
        """Sync queued events to backend"""
        self.logger.info("Syncing events to backend...")
        
        try:
            # Get pending events
            events = self.event_queue.get_pending_events(limit=self.config.queue.batch_size)
            
            if not events:
                self.logger.debug("No pending events to sync")
                return
            
            # Send events to backend
            for event in events:
                try:
                    await self.backend_client.send_event(event)
                    self.event_queue.mark_event_synced(event.event_id)
                    self.logger.debug(f"Event {event.event_id} synced successfully")
                    
                except Exception as e:
                    self.logger.error(f"Failed to sync event {event.event_id}: {e}")
                    # Event remains in queue for retry
            
            self.logger.info(f"Synced {len(events)} events to backend")
            
        except Exception as e:
            self.logger.error(f"Sync failed: {e}")
    
    async def create_event(self, event_type: str, data: dict) -> str:
        """
        Create and queue a new event
        
        Args:
            event_type: Type of event
            data: Event data
            
        Returns:
            Event ID
        """
        event_id = str(uuid.uuid4())
        
        event = {
            "eventId": event_id,
            "eventType": event_type,
            "deviceId": self.device_id,
            "tenantId": self.tenant_id,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data,
            "synced": False
        }
        
        self.event_queue.add_event(event)
        self.logger.info(f"Created event {event_id} of type {event_type}")
        
        return event_id
