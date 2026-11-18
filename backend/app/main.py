"""
VERITAS AI - Main Application Entrypoint
FastAPI application with CORS, centralized exception handling, and API routing.
"""

import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from backend.app.api.routes import router as api_router
from backend.app.core.config import settings
from backend.app.core.logging import logger

app = FastAPI(
    title="VERITAS AI",
    description="Autonomous Multi-Agent Fact-Verification and Research Platform (PromptWars PS03)",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local dev access from Vite and any test runner
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Prevents leaking internal stack traces or server paths to clients.
    Logs sanitized details internally.
    """
    logger.error(f"Unhandled server error on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred while processing the research request. Please retry shortly.",
            "path": request.url.path
        }
    )


# Register API Router
app.include_router(api_router)

# Production Unified Frontend Static Serving (Enables true 1-click single-port deployment)
FRONTEND_DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if not os.path.exists(FRONTEND_DIST_DIR):
    FRONTEND_DIST_DIR = os.path.abspath("/app/frontend/dist")

if os.path.exists(FRONTEND_DIST_DIR):
    assets_dir = os.path.join(FRONTEND_DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_frontend(full_path: str):
        if full_path.startswith("api/") or full_path in ("api", "docs", "redoc", "openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        target_file = os.path.join(FRONTEND_DIST_DIR, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        index_file = os.path.join(FRONTEND_DIST_DIR, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"detail": "Index file not found"})
else:
    @app.get("/")
    async def root():
        return {
            "platform": "VERITAS AI",
            "description": "Autonomous Multi-Agent Research & Fact-Verification Platform",
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "health": "/api/health"
        }
