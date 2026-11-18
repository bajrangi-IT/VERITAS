# 🚀 VERITAS AI — 1-Click Deployment Guide

VERITAS AI is engineered for **instant, zero-friction 1-click deployment** across modern cloud platforms, container registries, and local environments. The platform integrates a unified production runtime where FastAPI directly serves both the REST/SSE APIs and the compiled React TypeScript application from a single port.

---

## 🌐 1-Click Cloud Deployments

Deploy VERITAS AI to production with a single click:

### Option A: Render (Recommended Cloud Deployment)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Click the **Deploy to Render** button above or connect your GitHub repository to [Render](https://render.com).
2. Render detects `render.yaml` automatically.
3. Click **Apply** — Render builds the multi-stage Docker container and deploys with automatic HTTPS and `/api/health` monitoring.

---

### Option B: Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

1. Click **Deploy on Railway** or connect your public GitHub repository.
2. Railway reads `railway.json` and `Dockerfile`.
3. The platform deploys automatically with healthcheck restarts enabled.

---

### Option C: Google Cloud Run (Serverless Container)
Deploy from your terminal in 1 command:
```bash
gcloud run deploy veritas-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8000
```

---

## 🐳 1-Click Local Docker Deployment

Run the complete multi-agent platform locally with Docker Compose:

```bash
docker compose up --build
```

- **User Interface**: [http://localhost:8000/](http://localhost:8000/)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Telemetry**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 💻 1-Click Local Host Deployment (No Docker Required)

### Windows
Double-click `run.bat` or run in terminal:
```cmd
run.bat
```

### macOS / Linux
Run the executable shell script:
```bash
chmod +x run.sh
./run.sh
```

### Cross-Platform Python Launcher
```bash
python start.py
```
*The launcher checks your environment, builds static assets if necessary, initializes Uvicorn, and automatically opens your default web browser to `http://localhost:8000`.*

---

## ⚙️ Environment Variables Reference

All environment variables have robust production defaults; no third-party API key is mandatory for evaluation.

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `PORT` | `8000` | Application HTTP listening port. |
| `SEARCH_PROVIDER` | `hybrid` | Search engine provider (`hybrid`, `mock`, `tavily`, `duckduckgo`, `wikipedia`). |
| `TAVILY_API_KEY` | *(optional)* | Tavily Search API key for expanded web crawling. |
| `MAX_CONCURRENT_SEARCHES` | `4` | Concurrency boundary for parallel subquery execution. |
| `LOG_LEVEL` | `INFO` | Application log verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`). |
