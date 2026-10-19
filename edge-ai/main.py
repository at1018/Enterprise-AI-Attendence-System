#!/usr/bin/env python3
"""
Edge Agent Main Entry Point
AI School Classroom Attendance Platform - Phase 6: Edge Agent Foundation
"""

import asyncio
import sys
from app.agent import EdgeAgent
from configuration.config import load_config
from logging.logger import setup_logger

async def main():
    """Main entry point for the Edge Agent"""
    
    # Load configuration
    config = load_config()
    
    # Setup logging
    logger = setup_logger(config.log_level)
    logger.info("Starting Edge Agent...")
    
    # Initialize and start the Edge Agent
    agent = EdgeAgent(config, logger)
    
    try:
        await agent.start()
    except KeyboardInterrupt:
        logger.info("Shutting down Edge Agent...")
        await agent.stop()
    except Exception as e:
        logger.error(f"Edge Agent error: {e}")
        await agent.stop()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
