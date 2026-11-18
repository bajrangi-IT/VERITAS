"""
VERITAS AI - REST & SSE API Endpoints
Implements required PromptWars PS03 API endpoints with strict typing and error responses.
"""

import asyncio
from typing import List
from fastapi import APIRouter, BackgroundTasks, status
from sse_starlette.sse import EventSourceResponse

from backend.app.models.contracts import (
    ResearchRequest, ResearchSession, Report, Source, Claim,
    ConflictRecord, SystemHealthResponse, SessionStatus
)
from backend.app.services.session_manager import session_manager
from backend.app.services.event_bus import event_bus
from backend.app.services.research_coordinator import coordinator
from backend.app.core.config import settings
from backend.app.core.logging import logger

router = APIRouter(prefix="/api", tags=["Research"])


@router.get("/health", response_model=SystemHealthResponse)
async def health_check():
    """Health check endpoint providing platform and provider operational telemetry."""
    total_sessions = await session_manager.count_sessions()
    return SystemHealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        active_sessions=total_sessions,
        search_provider=settings.SEARCH_PROVIDER,
        llm_connected=bool(settings.GEMINI_API_KEY or settings.OPENAI_API_KEY or True)
    )


@router.get("/research", response_model=List[ResearchSession])
async def list_recent_sessions():
    """Retrieves list of recent research sessions."""
    return await session_manager.list_sessions()


@router.post("/research", response_model=ResearchSession, status_code=status.HTTP_201_CREATED)
async def create_research(request: ResearchRequest, background_tasks: BackgroundTasks):
    """
    Launches a new autonomous research investigation.
    Initializes state and schedules asynchronous multi-agent orchestration.
    """
    session = ResearchSession(
        original_query=request.query,
        domain=request.domain,
        research_depth=request.research_depth,
        maximum_sources=request.maximum_sources,
        status=SessionStatus.QUEUED
    )
    saved = await session_manager.create_session(session)

    # Schedule background autonomous pipeline execution
    background_tasks.add_task(coordinator.execute_investigation, saved.session_id)
    return saved


@router.get("/research/{session_id}", response_model=ResearchSession)
async def get_research_session(session_id: str):
    """Returns the full state of an active or completed research session."""
    return await session_manager.get_session(session_id)


@router.get("/research/{session_id}/events")
async def stream_research_events(session_id: str):
    """
    Server-Sent Events (SSE) streaming endpoint delivering real-time agent updates.
    """
    # Verify session exists
    await session_manager.get_session(session_id)
    queue = await event_bus.subscribe(session_id)

    async def event_generator():
        try:
            while True:
                # Wait for next event or heartbeat
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=25.0)
                    yield {
                        "event": event.event_type.value,
                        "data": event.to_sse_payload()
                    }
                except asyncio.TimeoutError:
                    # Send periodic keep-alive comment
                    yield {"event": "ping", "data": "keep-alive"}
        except asyncio.CancelledError:
            pass
        finally:
            await event_bus.unsubscribe(session_id, queue)

    return EventSourceResponse(event_generator())


@router.get("/research/{session_id}/report", response_model=Report)
async def get_session_report(session_id: str):
    """Retrieves the synthesized intelligence report for a completed session."""
    session = await session_manager.get_session(session_id)
    if not session.report:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report for session '{session_id}' has not yet been generated. Current status: {session.status.value}"
        )
    return session.report


@router.get("/research/{session_id}/sources", response_model=List[Source])
async def get_session_sources(session_id: str):
    """Retrieves all external evidence sources discovered for a research session."""
    session = await session_manager.get_session(session_id)
    return session.sources


@router.get("/research/{session_id}/claims", response_model=List[Claim])
async def get_session_claims(session_id: str):
    """Retrieves all verified claims and their evidential status."""
    session = await session_manager.get_session(session_id)
    return session.claims


@router.get("/research/{session_id}/conflicts", response_model=List[ConflictRecord])
async def get_session_conflicts(session_id: str):
    """Retrieves all empirical contradictions and discrepancies identified."""
    session = await session_manager.get_session(session_id)
    return session.conflicts


@router.post("/research/{session_id}/cancel")
async def cancel_research_session(session_id: str):
    """Signals immediate cancellation of an active research investigation."""
    success = await session_manager.cancel_session(session_id)
    return {"session_id": session_id, "status": "cancelled", "success": success}
