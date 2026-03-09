# OptiView Backend

High-performance image delivery backend service built with NestJS.

## Overview

This is the backend service for **OptiView** - a web application designed to demonstrate high-performance image delivery. The system serves images optimized for user's screen size, pixel density, and browser format support.

For detailed architecture decisions, see [../doc/ADR.md](../doc/ADR.md).

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Docker | 20.x+ | Container runtime |
| Docker Compose | 2.x+ | Multi-container orchestration |
| Node.js | 20.x+ | Local development (optional) |
| npm | 10.x+ | Package manager |

## Quick Start

### 1. Configure Environment Variables

Edit `.env` in the project root:

### 2. Install dependecies

```bash
$ npm install
```

### 3. Start Database

```bash
# Build and start all services
docker-compose up -d
```

### 4. Start dev server

```bash
# watch mode
$ npm run start:dev
```

### 5. Verify Services

```bash
# Check health endpoint
curl http://localhost:3000

# Expected response
# {"statusCode":200,"message":"Hello World!"}
```

The backend API is now running at `http://localhost:3000`.
