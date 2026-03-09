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

### 1. Clone and Configure Environment

```bash
# Clone the repository
git clone <repository-url>
cd OptiView

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
```

### 2. Configure Environment Variables

Edit `.env` in the project root:

```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=optiview
DB_PASSWORD=your_secure_password_here
DB_NAME=optiview

# Node Environment
NODE_ENV=development
```

### 3. Start Services with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### 4. Verify Services

```bash
# Check health endpoint
curl http://localhost:3000

# Expected response
# {"statusCode":200,"message":"Hello World!"}
```

The backend API is now running at `http://localhost:3000`.

## Available npm Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build the application for production |
| `npm run start` | Start the application |
| `npm run start:dev` | Start in development mode with hot reload |
| `npm run start:debug` | Start in debug mode with inspector |
| `npm run start:prod` | Start production build |
| `npm run lint` | Run ESLint on source files |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage report |
| `npm run test:e2e` | Run end-to-end tests |

## Environment Variables Reference

### Application Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port number |
| `NODE_ENV` | `development` | Environment mode |

### Database Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | `postgres` | Database password |
| `DB_NAME` | `optiview` | Database name |

## Development Workflow

### Local Development with Docker

```bash
# Start PostgreSQL only
docker-compose up -d postgres

# Run backend locally with hot reload
cd backend
npm install
npm run start:dev
```

### Full Stack with Docker

```bash
# Start all services
docker-compose up -d

# Rebuild after dependency changes
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Database Management

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U optiview -d optiview

# View database logs
docker-compose logs postgres
```

## Testing

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:cov

# Run specific test file
npm run test -- image.service.spec.ts
```

### End-to-End Tests

```bash
# Run e2e tests
npm run test:e2e
```

## Project Structure

```
backend/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root module
│   ├── app.controller.ts       # Health check controller
│   ├── app.service.ts          # Health check service
│   └── config/
│       └── database.config.ts  # TypeORM configuration
├── test/
│   ├── app.e2e-spec.ts         # E2E tests
│   └── jest-e2e.json           # E2E Jest config
├── Dockerfile                   # Production Docker image
├── .dockerignore               # Docker ignore rules
├── nest-cli.json               # NestJS CLI config
├── tsconfig.json               # TypeScript config
├── tsconfig.build.json         # TypeScript build config
└── package.json                # Dependencies and scripts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/images` | List images with filters and pagination |
| GET | `/api/images/:id?width=N` | Get processed image |
| GET | `/api/images/:id/metadata` | Get image metadata |
| POST | `/api/images/upload` | Upload new image |
| GET | `/api/images/:id/lqip` | Get LQIP placeholder |
| PATCH | `/api/images/:id/rating` | Update image rating |

> Note: Image processing endpoints will be implemented in Stage 2-3.

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Port Already in Use

```bash
# Find process using port 3000
# Windows PowerShell
netstat -ano | findstr :3000

# Kill the process or change PORT in .env
```

### Docker Issues

```bash
# Clean Docker state
docker-compose down -v
docker system prune -f

# Rebuild containers
docker-compose up -d --build
```

## Related Documentation

- [Architecture Decision Record](../doc/ADR.md) - Technical decisions and rationale
- [Product Requirements](../doc/PRD.md) - Feature requirements and constraints
- [Implementation Plan](../doc/implementation-plan.md) - Development roadmap
- [UI Specifications](../doc/UI.md) - Frontend design guidelines

## Development Status

**Current Stage:** Stage 0 - Infrastructure Setup ✅

- [x] NestJS project initialized
- [x] Docker Compose configuration
- [x] PostgreSQL with health checks
- [x] TypeORM integration
- [x] Basic health check endpoint

**Next Stages:**
- [ ] Stage 1: Database & Entities
- [ ] Stage 2: Image Processing Service
- [ ] Stage 3: REST API Endpoints
