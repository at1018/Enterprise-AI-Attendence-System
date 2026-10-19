# AI School Classroom Attendance Platform

## Overview
This repository is the foundation for the AI School Classroom Attendance Platform. The project follows the approved Phase 0 foundation requirements and is intended to evolve through the later phases of the platform roadmap.

## Stack
- Backend: Node.js + TypeScript + Express.js
- Frontend: React + TypeScript + Vite
- Database: PostgreSQL (local installation)
- ORM: Prisma

## Repository structure
- backend/ - Express.js backend foundation
- frontend/ - React + Vite frontend foundation
- edge-ai/ - reserved for future edge AI work
- database/ - reserved for future database artifacts
- infrastructure/ - reserved for future deployment/infrastructure work
- docs/ - project governance and architecture documentation

## Prerequisites
- Node.js 22+
- npm 10+
- PostgreSQL (local installation)

## Quick start

### 1. Setup PostgreSQL (development database)
Ensure PostgreSQL is installed and running locally. Create a database:
```bash
# Make sure PostgreSQL is running
# On Windows: Check if PostgreSQL service is running
# On Mac/Linux: sudo service postgresql start

# Create database
createdb ai_school_platform_dev

# Or use psql
psql -U postgres -c "CREATE DATABASE ai_school_platform_dev;"
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Update DATABASE_URL in .env with your PostgreSQL credentials
# Default: postgresql://postgres:your_password@localhost:5432/ai_school_platform_dev
npm run start:dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Testing
```bash
cd backend
npm test

cd ../frontend
npm run build
```

## Notes
This repository intentionally contains only the foundation for Phase 0. Business features, authentication, attendance logic, classroom workflows, and AI functionality belong to later phases.
