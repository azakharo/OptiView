# OptiView Deployment Guide

This guide covers the complete deployment process for OptiView using Docker Compose on a VPS.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Server Setup](#2-server-setup)
3. [Application Deployment](#3-application-deployment)
4. [SSL Certificate Configuration](#4-ssl-certificate-configuration)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Database Management](#6-database-management)
7. [Monitoring and Logging](#7-monitoring-and-logging)
8. [Update Procedures](#8-update-procedures)
9. [Troubleshooting Guide](#9-troubleshooting-guide)
10. [Architecture Overview](#10-architecture-overview)

---

## 1. Prerequisites

### VPS Requirements

| Resource | Minimum          | Recommended      |
|:---------|:-----------------|:-----------------|
| RAM      | 2 GB             | 4 GB             |
| CPU      | 1 vCPU           | 2 vCPU           |
| Storage  | 20 GB SSD        | 40 GB SSD        |
| OS       | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Required Software

- Docker Engine 24.0+
- Docker Compose v2.0+

### Domain Name (Optional)

A domain name is optional for initial deployment. You can deploy using just the server IP address with self-signed certificates. For production use with proper SSL, configure a domain name pointing to your server IP.

---

## 2. Server Setup

### Initial Server Security

#### SSH Key Authentication

1. Generate SSH keys on your local machine:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. Copy the public key to your server:

```bash
ssh-copy-id root@your_server_ip
```

3. Test SSH key login:

```bash
ssh root@your_server_ip
```

4. Disable password authentication by editing `/etc/ssh/sshd_config`:

```bash
# Set these options
PasswordAuthentication no
PubkeyAuthentication yes
```

5. Restart SSH service:

```bash
sudo systemctl restart sshd
```

#### Firewall Setup

1. Update package lists:

```bash
sudo apt update
```

2. Install UFW (Uncomplicated Firewall):

```bash
sudo apt install ufw
```

3. Allow necessary ports:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

4. Enable the firewall:

```bash
sudo ufw enable
```

5. Verify status:

```bash
sudo ufw status
```

### Docker Installation

1. Install required packages:

```bash
sudo apt install -y ca-certificates curl gnupg
```

2. Add Docker's official GPG key:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

3. Set up the Docker repository:

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

4. Install Docker Engine:

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

5. Start and enable Docker:

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

6. Add your user to the docker group (optional, for non-root access):

```bash
sudo usermod -aG docker $USER
newgrp docker
```

7. Verify Docker installation:

```bash
docker --version
docker compose version
```

---

## 3. Application Deployment

### Clone Repository

1. Clone the OptiView repository:

```bash
git clone <your-repository-url> optiview
cd optiview
```

### Environment Configuration

1. Copy the environment template:

```bash
cp .env.production.example .env.production
```

2. Edit `.env.production` with your values:

```bash
nano .env.production
```

3. Set a secure database password:

```bash
# Generate a strong password
openssl rand -base64 32
```

4. Update the `.env.production` file:

```env
DB_USERNAME=postgres
DB_PASSWORD=<your-generated-password>
DB_DATABASE=optiview
VITE_API_URL=/api
```

### SSL Certificate Setup

For initial deployment or testing, use self-signed certificates:

```bash
./scripts/generate-dev-certs.sh
```

For production with a domain name, see [SSL Certificate Configuration](#4-ssl-certificate-configuration).

### Build and Start Containers

1. Build and start all services:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

2. Wait for all services to become healthy:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

All services should show `healthy` in the status column.

### Verify Deployment

1. Check container logs:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f
```

2. Test the health endpoint:

```bash
# HTTP test (should redirect to HTTPS)
curl -I http://your_server_ip/health

# HTTPS test (use -k for self-signed certificates)
curl -k https://your_server_ip/health
```

3. Access the application:
   - Open `https://your_server_ip` in your browser
   - Accept the security warning for self-signed certificates
   - Verify the frontend loads correctly
   - Test API endpoints at `https://your_server_ip/api/docs`

---

## 4. SSL Certificate Configuration

### Self-Signed Certificates (Development/Testing)

Self-signed certificates are suitable for development and testing. Browsers will show security warnings.

Use the provided script to generate certificates:

```bash
./scripts/generate-dev-certs.sh
```

This script:
- Creates the `nginx/ssl/` directory if it doesn't exist
- Generates a self-signed certificate valid for 365 days
- Sets appropriate file permissions (644 for cert, 600 for key)
- Creates certificates for `localhost` and `127.0.0.1`

**Certificate locations:**
- Certificate: `nginx/ssl/cert.pem`
- Private key: `nginx/ssl/key.pem`

### Let's Encrypt Certificates (Production)

For production deployments with a domain name, use Let's Encrypt for trusted SSL certificates.

#### Prerequisites

- A valid domain name pointing to your server IP
- Port 80 and 443 accessible from the internet
- Nginx container stopped (to free port 80)

#### Install Certbot

```bash
sudo apt update
sudo apt install certbot
```

#### Generate Certificates

1. Stop the nginx container temporarily:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production stop nginx
```

2. Generate certificates using certbot standalone mode:

```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

3. Follow the prompts to complete certificate generation.

4. Copy certificates to the project:

```bash
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
sudo chown -R $USER:$USER nginx/ssl
```

5. Restart the nginx container:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production start nginx
```

#### Auto-Renewal Setup

Let's Encrypt certificates are valid for 90 days. Set up automatic renewal.

1. Create a renewal script:

```bash
cat > scripts/renew-ssl.sh << 'EOF'
#!/bin/bash
set -e

PROJECT_DIR="/path/to/optiview"
DOMAIN="yourdomain.com"

# Renew certificates
certbot renew --quiet

# Copy renewed certificates
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $PROJECT_DIR/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $PROJECT_DIR/nginx/ssl/key.pem

# Reload nginx
docker compose -f $PROJECT_DIR/docker-compose.prod.yml exec nginx nginx -s reload
EOF

chmod +x scripts/renew-ssl.sh
```

2. Add to crontab (runs weekly):

```bash
(crontab -l 2>/dev/null; echo "0 3 * * 0 /path/to/optiview/scripts/renew-ssl.sh") | crontab -
```

---

## 5. Environment Variables Reference

| Variable       | Required | Default    | Description                                       |
|:---------------|:---------|:-----------|:--------------------------------------------------|
| `DB_USERNAME`  | No       | `postgres` | PostgreSQL database username                      |
| `DB_PASSWORD`  | **Yes**  | -          | PostgreSQL database password (required)           |
| `DB_DATABASE`  | No       | `optiview` | PostgreSQL database name                          |
| `VITE_API_URL` | No       | `/api`     | API URL for frontend (use `/api` for same-origin) |

### Configuration Examples

#### Same-Origin Deployment (Recommended)

Frontend and backend served from the same domain:

```env
VITE_API_URL=/api
```

#### Cross-Origin Deployment

Frontend and backend on different domains:

```env
VITE_API_URL=https://api.yourdomain.com
```

---

## 6. Database Management

### Database Migrations

Migrations run automatically when the backend application starts. TypeORM checks the `migrations` table and applies any pending mmigrations automatically. This ensures the database schema is always up-to-date with the application code.

To check migration status:

```bash
# Access backend container
docker compose -f docker-compose.prod.yml exec backend sh

# Check migration status
npm run migration:show
```

### Seeding Test Data

Seed data is for testing/demo purposes only. Run it from your local machine pointing to the production API.

The seed script uploads 20 test images from picsum.photos to your database via the API.

```bash
# From your local machine, pointing to production (Linux/Mac)
BACKEND_URL=https://your-server.com NODE_TLS_REJECT_UNAUTHORIZED=0 npm run db:seed

# From your local machine, pointing to production (Windows PowerShell)
$env:BACKEND_URL="https://your-server.com"; $env:NODE_TLS_REJECT_UNAUTHORIZED="0"; npm run db:seed
```

**Important:**
- `BACKEND_URL` should NOT include `/api` at the end - the script adds it automatically
- `NODE_TLS_REJECT_UNAUTHORIZED=0` is only required for self-signed certificates (development/testing)
- For production with Let's Encrypt certificates, you don't need this variable
- Ensure your server firewall allows access to port 443 (HTTPS)

### Backup Considerations

Automated backup scripts are not included in this phase. For manual backups:

```bash
# Create a backup
docker compose -f docker-compose.prod.yml --env-file .env.production exec postgres pg_dump -U postgres optiview > backup_$(date +%Y%m%d).sql

# Restore from backup
cat backup_20260320.sql | docker compose -f docker-compose.prod.yml --env-file .env.production exec -T postgres psql -U postgres optiview
```

**Important:** Implement regular backup procedures before deploying to production.

---

## 7. Monitoring and Logging

### Viewing Container Logs

View all service logs:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f
```

View logs for a specific service:

```bash
# Nginx logs
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f nginx

# Backend logs
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f backend

# Postgres logs
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f postgres
```

View last 100 lines:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 backend
```

### Health Check Endpoints

| Service  | Endpoint    | Description                        |
|:---------|:------------|:-----------------------------------|
| Nginx    | `/health`   | Returns `ok` if nginx is running   |
| Backend  | `/health`   | Returns `ok` if backend is healthy |
| API Docs | `/api/docs` | Swagger UI for API documentation   |

Test health endpoints:

```bash
# Nginx health
curl -k https://your_server_ip/health

# Backend health (via nginx proxy)
curl -k https://your_server_ip/api/health

# API documentation
curl -k https://your_server_ip/api/docs
```

### Container Status

Check container health status:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

Expected output shows all services as `healthy`:

```
NAME                 STATUS
optiview_nginx       Up 2 minutes (healthy)
optiview_backend     Up 2 minutes (healthy)
optiview_postgres    Up 2 minutes (healthy)
```

### Resource Usage

Monitor container resource usage:

```bash
docker stats
```

---

## 8. Update Procedures

### Standard Update

1. SSH into your server:

```bash
ssh user@your_server_ip
cd optiview
```

2. Pull the latest changes:

```bash
git pull origin main
```

3. Rebuild and restart containers:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

4. Verify the update:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f --tail=50
```

### Quick Restart (No Code Changes)

If you only changed environment variables:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Rollback Procedure

If an update causes issues:

1. Stop the current containers:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production down
```

2. Checkout the previous version:

```bash
git log --oneline -5  # Find the previous commit
git checkout <previous-commit-hash>
```

3. Rebuild and start:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

4. After verifying, return to the latest commit and fix issues:

```bash
git checkout main
```

---

## 9. Troubleshooting Guide

### Container Won't Start

**Symptoms:** Container exits immediately or keeps restarting.

**Diagnosis:**

```bash
# Check container status
docker compose -f docker-compose.prod.yml --env-file .env.production ps

# View container logs
docker compose -f docker-compose.prod.yml --env-file .env.production logs backend
```

**Common Causes:**

1. Missing environment variables:

```bash
# Verify .env.production exists
cat .env.production
```

2. Port conflicts:

```bash
# Check if ports are in use
sudo lsof -i :80
sudo lsof -i :443
```

3. Docker resource limits exceeded:

```bash
# Check Docker disk usage
docker system df
```

### Database Connection Issues

**Symptoms:** Backend logs show "Connection refused" or "ECONNREFUSED".

**Diagnosis:**

```bash
# Check if postgres is healthy
docker compose -f docker-compose.prod.yml --env-file .env.production ps postgres

# Check postgres logs
docker compose -f docker-compose.prod.yml --env-file .env.production logs postgres
```

**Solutions:**

1. Verify database credentials in `.env.production`:

```bash
cat .env.production | grep DB_
```

2. Ensure postgres container is running:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production restart postgres
```

3. Test database connection from backend:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec backend sh
wget -qO- http://postgres:5432 || echo "Cannot reach postgres"
```

### SSL Certificate Problems

**Symptoms:** Browser shows SSL errors or warnings.

**For self-signed certificates:**

- This is expected behavior
- Click "Advanced" and "Proceed anyway" in your browser
- For API testing, use `-k` flag with curl:

```bash
curl -k https://your_server_ip/health
```

**For Let's Encrypt certificates:**

1. Verify certificate files exist:

```bash
ls -la nginx/ssl/
```

2. Check certificate validity:

```bash
openssl x509 -in nginx/ssl/cert.pem -text -noout
```

3. Verify certificate matches domain:

```bash
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Upload Issues

**Symptoms:** Image uploads fail or timeout.

**Diagnosis:**

```bash
# Check backend logs for upload errors
docker compose -f docker-compose.prod.yml --env-file .env.production logs backend | grep -i upload

# Check nginx logs
docker compose -f docker-compose.prod.yml --env-file .env.production logs nginx | grep -i upload
```

**Solutions:**

1. File size too large (default limit: 10MB):

Edit [`nginx/nginx.conf`](../nginx/nginx.conf) to increase `client_max_body_size`.

2. Rate limiting triggered:

Wait a moment and retry. Upload endpoint has stricter rate limiting (2 requests/second).

3. Permission issues:

```bash
# Check uploads volume
docker compose -f docker-compose.prod.yml --env-file .env.production exec backend ls -la /app/uploads
```

### Nginx Configuration Errors

**Symptoms:** Nginx container fails health check or won't start.

**Diagnosis:**

```bash
# Test nginx configuration
docker compose -f docker-compose.prod.yml --env-file .env.production exec nginx nginx -t
```

**Common Issues:**

1. Missing SSL certificates:

```bash
# Check if certificates exist
ls -la nginx/ssl/
```

2. Configuration syntax error:

```bash
# Validate configuration
docker compose -f docker-compose.prod.yml --env-file .env.production exec nginx nginx -t
```

---

## 10. Architecture Overview

### Docker Setup

OptiView uses a multi-container Docker architecture orchestrated by Docker Compose.

### Container Responsibilities

| Container  | Image                 | Purpose                                                                 |
|:-----------|:----------------------|:------------------------------------------------------------------------|
| `nginx`    | Custom (node + nginx) | Serves frontend static files, reverse proxy to backend, SSL termination |
| `backend`  | Custom (node-alpine)  | NestJS API server, image processing                                     |
| `postgres` | postgres:15-alpine    | PostgreSQL database                                                     |

### Network Configuration

```
┌─────────────────────────────────────────────────────────────┐
│                         VPS/Cloud VM                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Docker Network                      │   │
│  │                 (optiview-network)                   │   │
│  │                                                      │   │
│  │   ┌─────────┐    ┌─────────┐    ┌─────────────┐    │   │
│  │   │  nginx  │───▶│ backend │───▶│  postgres   │    │   │
│  │   │ :80/443 │    │  :3000  │    │    :5432    │    │   │
│  │   └─────────┘    └─────────┘    └─────────────┘    │   │
│  │        │              │                              │   │
│  └────────│──────────────│──────────────────────────────┘   │
│           │              │                                  │
│           ▼              ▼                                  │
│   ┌───────────────────────────────┐                        │
│   │        Docker Volumes         │                        │
│   │  • postgres_data (database)   │                        │
│   │  • uploads_data (images)      │                        │
│   └───────────────────────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **User Request** → Nginx (port 80/443)
2. **Static Files** → Served directly from nginx (frontend bundle)
3. **API Requests** → Proxied to backend (port 3000 internal)
4. **Database Queries** → Backend connects to postgres (port 5432 internal)

### Volume Configuration

| Volume          | Purpose                       | Persistence                           |
|:----------------|:------------------------------|:--------------------------------------|
| `postgres_data` | PostgreSQL data files         | Persists database across restarts     |
| `uploads_data`  | Uploaded and processed images | Persists user uploads across restarts |

### Static File Caching Strategy

| Asset Type             | Cache Duration | Cache-Control Header                  |
|:-----------------------|:---------------|:--------------------------------------|
| JS/CSS with hash       | 1 year         | `public, immutable`                   |
| Images (PNG, JPG, SVG) | 1 year         | `public, immutable`                   |
| Fonts (WOFF, WOFF2)    | 1 year         | `public, immutable`                   |
| index.html             | No cache       | `no-store, no-cache, must-revalidate` |

### Rate Limiting

| Endpoint                               | Rate Limit | Burst |
|:---------------------------------------|:-----------|:------|
| API endpoints (`/api/*`)               | 10 req/s   | 20    |
| Upload endpoint (`/api/images/upload`) | 2 req/s    | 5     |

---

## Quick Reference

### Common Commands

```bash
# Start all services
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# Stop all services
docker compose -f docker-compose.prod.yml --env-file .env.production down

# Rebuild and restart
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# View logs
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f

# Check status
docker compose -f docker-compose.prod.yml --env-file .env.production ps

# Restart a single service
docker compose -f docker-compose.prod.yml --env-file .env.production restart nginx
```

### File Locations

| File                                                                | Purpose                                 |
|:--------------------------------------------------------------------|:----------------------------------------|
| [`docker-compose.prod.yml`](../docker-compose.prod.yml)             | Production Docker Compose configuration |
| [`.env.production`](../.env.production)                             | Production environment variables        |
| [`nginx/nginx.conf`](../nginx/nginx.conf)                           | Nginx configuration                     |
| [`nginx/ssl/`](../nginx/ssl/)                                       | SSL certificates directory              |
| [`scripts/generate-dev-certs.sh`](../scripts/generate-dev-certs.sh) | Self-signed certificate generation      |
| [`backend/Dockerfile`](../backend/Dockerfile)                       | Backend container definition            |
| [`nginx/Dockerfile`](../nginx/Dockerfile)                           | Nginx + frontend container definition   |
