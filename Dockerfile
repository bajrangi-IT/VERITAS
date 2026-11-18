# ==============================================================================
# VERITAS AI - Unified Multi-Stage Production Dockerfile
# Provides 1-Click Deployment across Render, Railway, Cloud Run, AWS, Fly.io, etc.
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build the Modern React TypeScript Frontend
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy source and build static bundle
COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Python 3.12 Slim Production Runtime
# ------------------------------------------------------------------------------
FROM python:3.12-slim AS runtime
WORKDIR /app

# Install curl for container health check
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend /app/backend

# Copy compiled frontend from Stage 1 into the unified static distribution folder
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Set runtime environment variables
ENV PYTHONUNBUFFERED=1 \
    PORT=8000 \
    SEARCH_PROVIDER=hybrid \
    LOG_LEVEL=INFO

# Expose HTTP port
EXPOSE 8000

# Automated healthcheck against the VERITAS operational telemetry API
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/health || exit 1

# Launch FastAPI app with dynamic port binding for any cloud platform
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
