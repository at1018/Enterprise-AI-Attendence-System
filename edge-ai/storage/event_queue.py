"""
Offline Event Queue System
Provides durable local storage for events with retry logic
"""

import sqlite3
import json
import threading
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path

class EventQueue:
    """SQLite-based offline event queue with retry support"""
    
    def __init__(self, queue_file: str, max_size: int, logger):
        """
        Initialize event queue
        
        Args:
            queue_file: Path to SQLite database file
            max_size: Maximum number of events in queue
            logger: Logger instance
        """
        self.queue_file = Path(queue_file)
        self.max_size = max_size
        self.logger = logger
        self.lock = threading.Lock()
        
        # Initialize database
        self._init_database()
    
    def _init_database(self):
        """Initialize SQLite database for event queue"""
        self.queue_file.parent.mkdir(parents=True, exist_ok=True)
        
        with sqlite3.connect(self.queue_file) as conn:
            cursor = conn.cursor()
            
            # Create events table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS events (
                    event_id TEXT PRIMARY KEY,
                    event_type TEXT NOT NULL,
                    device_id TEXT NOT NULL,
                    tenant_id TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    data TEXT NOT NULL,
                    synced INTEGER DEFAULT 0,
                    retry_count INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create indexes for performance
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_synced 
                ON events(synced)
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_timestamp 
                ON events(timestamp)
            """)
            
            conn.commit()
            self.logger.info(f"Event queue initialized: {self.queue_file}")
    
    def add_event(self, event: Dict[str, Any]) -> bool:
        """
        Add event to queue
        
        Args:
            event: Event data
            
        Returns:
            True if event was added successfully
        """
        with self.lock:
            try:
                # Check queue size
                count = self._get_count()
                if count >= self.max_size:
                    self.logger.warning(f"Queue full ({count}/{self.max_size}), dropping oldest event")
                    self._remove_oldest_event()
                
                with sqlite3.connect(self.queue_file) as conn:
                    cursor = conn.cursor()
                    
                    cursor.execute("""
                        INSERT INTO events 
                        (event_id, event_type, device_id, tenant_id, timestamp, data, synced, retry_count)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        event["eventId"],
                        event["eventType"],
                        event["deviceId"],
                        event["tenantId"],
                        event["timestamp"],
                        json.dumps(event["data"]),
                        0,  # not synced
                        0   # no retries
                    ))
                    
                    conn.commit()
                    self.logger.debug(f"Event {event['eventId']} added to queue")
                    return True
                    
            except sqlite3.IntegrityError:
                self.logger.warning(f"Event {event['eventId']} already exists in queue")
                return False
            except Exception as e:
                self.logger.error(f"Failed to add event {event['eventId']}: {e}")
                return False
    
    def get_pending_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get pending (unsynced) events from queue
        
        Args:
            limit: Maximum number of events to return
            
        Returns:
            List of pending events
        """
        with self.lock:
            try:
                with sqlite3.connect(self.queue_file) as conn:
                    cursor = conn.cursor()
                    
                    cursor.execute("""
                        SELECT event_id, event_type, device_id, tenant_id, 
                               timestamp, data, synced, retry_count
                        FROM events
                        WHERE synced = 0
                        ORDER BY created_at ASC
                        LIMIT ?
                    """, (limit,))
                    
                    events = []
                    for row in cursor.fetchall():
                        events.append({
                            "eventId": row[0],
                            "eventType": row[1],
                            "deviceId": row[2],
                            "tenantId": row[3],
                            "timestamp": row[4],
                            "data": json.loads(row[5]),
                            "synced": bool(row[6]),
                            "retryCount": row[7]
                        })
                    
                    return events
                    
            except Exception as e:
                self.logger.error(f"Failed to get pending events: {e}")
                return []
    
    def mark_event_synced(self, event_id: str) -> bool:
        """
        Mark event as synced
        
        Args:
            event_id: Event ID
            
        Returns:
            True if event was marked successfully
        """
        with self.lock:
            try:
                with sqlite3.connect(self.queue_file) as conn:
                    cursor = conn.cursor()
                    
                    cursor.execute("""
                        UPDATE events
                        SET synced = 1, updated_at = ?
                        WHERE event_id = ?
                    """, (datetime.utcnow().isoformat(), event_id))
                    
                    conn.commit()
                    self.logger.debug(f"Event {event_id} marked as synced")
                    return True
                    
            except Exception as e:
                self.logger.error(f"Failed to mark event {event_id} as synced: {e}")
                return False
    
    def increment_retry_count(self, event_id: str) -> bool:
        """
        Increment retry count for failed event
        
        Args:
            event_id: Event ID
            
        Returns:
            True if retry count was incremented
        """
        with self.lock:
            try:
                with sqlite3.connect(self.queue_file) as conn:
                    cursor = conn.cursor()
                    
                    cursor.execute("""
                        UPDATE events
                        SET retry_count = retry_count + 1, updated_at = ?
                        WHERE event_id = ?
                    """, (datetime.utcnow().isoformat(), event_id))
                    
                    conn.commit()
                    return True
                    
            except Exception as e:
                self.logger.error(f"Failed to increment retry count for event {event_id}: {e}")
                return False
    
    def _get_count(self) -> int:
        """Get total number of events in queue"""
        with sqlite3.connect(self.queue_file) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM events")
            return cursor.fetchone()[0]
    
    def _remove_oldest_event(self) -> bool:
        """Remove oldest event from queue"""
        try:
            with sqlite3.connect(self.queue_file) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    DELETE FROM events
                    WHERE event_id = (
                        SELECT event_id FROM events
                        ORDER BY created_at ASC
                        LIMIT 1
                    )
                """)
                
                conn.commit()
                return True
                
        except Exception as e:
            self.logger.error(f"Failed to remove oldest event: {e}")
            return False
    
    def get_statistics(self) -> Dict[str, int]:
        """
        Get queue statistics
        
        Returns:
            Dictionary with queue statistics
        """
        with sqlite3.connect(self.queue_file) as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM events")
            total = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM events WHERE synced = 0")
            pending = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM events WHERE synced = 1")
            synced = cursor.fetchone()[0]
            
            return {
                "total": total,
                "pending": pending,
                "synced": synced
            }
    
    def close(self):
        """Close database connection"""
        self.logger.info("Event queue closed")
