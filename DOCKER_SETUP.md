# Docker Setup for TODO Application

This document explains how to set up and run the entire TODO application stack using Docker Compose.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Clone and navigate to the project directory**
   ```bash
   cd TODO
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the applications**
   - Frontend: http://localhost:7038
   - Backend API: http://localhost:7035
   - CouchDB: http://localhost:5984

## Services Overview

### 1. CouchDB Database
- **Container**: `todo-couchdb`
- **Port**: 5984
- **Credentials**: admin/password
- **Data Persistence**: Yes (volumes: `couchdb_data`, `couchdb_config`)

### 2. Backend API (FastAPI)
- **Container**: `todo-backend`
- **Port**: 7035
- **Hot Reload**: Enabled
- **Dependencies**: CouchDB

### 3. Frontend (React + Vite)
- **Container**: `todo-frontend`
- **Port**: 7038
- **Hot Reload**: Enabled
- **Dependencies**: Backend

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# CouchDB Configuration
COUCHDB_USER=admin
COUCHDB_PASSWORD=password
COUCHDB_PORT=5984
COUCHDB_DATABASE=todo_tasks

# Backend Configuration
BACKEND_PORT=7035
PYTHONPATH=/app

# Frontend Configuration
FRONTEND_PORT=7038
VITE_API_BASE_URL=http://localhost:7035
VITE_ENVIRONMENT=development
VITE_DEBUG=true

# Application Settings
VITE_APP_NAME=Calendar-Integrated To-Do App
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_SOFT_DELETE=true
VITE_ENABLE_CALENDAR_VIEW=true
VITE_ENABLE_STATUS_TRACKING=true
```

## Useful Commands

### Start services
```bash
docker-compose up -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f couchdb
```

### Stop services
```bash
docker-compose down
```

### Rebuild and start
```bash
docker-compose up -d --build
```

### Remove everything (including volumes)
```bash
docker-compose down -v
```

### Access CouchDB Fauxton (Web UI)
- URL: http://localhost:5984/_utils
- Username: admin
- Password: password

## Data Persistence

The following data is persisted across container restarts:

- **CouchDB Data**: Stored in `couchdb_data` volume
- **CouchDB Configuration**: Stored in `couchdb_config` volume
- **Source Code**: Mounted from host directories for hot reloading

## Development Workflow

1. **Code Changes**: Edit files in your IDE - changes are reflected immediately due to volume mounts
2. **Dependencies**: If you add new dependencies, rebuild the containers:
   ```bash
   docker-compose up -d --build
   ```
3. **Database Changes**: CouchDB data persists across restarts
4. **Environment Changes**: Update `.env` file and restart services

## Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs [service-name]

# Check if ports are available
netstat -tulpn | grep :7035
netstat -tulpn | grep :7038
netstat -tulpn | grep :5984
```

### Database connection issues
- Ensure CouchDB is healthy: `docker-compose ps`
- Check CouchDB logs: `docker-compose logs couchdb`
- Verify credentials in backend environment variables

### Frontend can't connect to backend
- Check if backend is running: `docker-compose ps`
- Verify `VITE_API_BASE_URL` in frontend environment
- Check network connectivity between containers

## Network Architecture

All services communicate through the `todo-network` bridge network:
- Frontend → Backend: `http://backend:7035`
- Backend → CouchDB: `http://couchdb:5984`
- External access through exposed ports 