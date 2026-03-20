# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Install build dependencies for Sharp native module
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build
FROM node:22-alpine AS build
WORKDIR /app

# Install build dependencies for Sharp native module
RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build
RUN npm prune --production

# Stage 3: Production
FROM node:22-alpine AS production
WORKDIR /app

# Install runtime dependencies for Sharp and wget for healthcheck
RUN apk add --no-cache libc6-compat wget

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001

# Copy built application and production dependencies
COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/package.json ./

# Create uploads directory structure
RUN mkdir -p /app/uploads/originals /app/uploads/processed /app/uploads/lqip && \
    chown -R appuser:appgroup /app/uploads

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -qO- http://localhost:3000/health || exit 1

USER appuser
CMD ["node", "dist/main.js"]
