"""
VERITAS AI - Research Session Manager
Thread-safe in-memory session repository with cancellation and state persistence.
"""

import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Optional
from backend.app.models.contracts import (
    ResearchSession, SessionStatus, Source, Claim, ConflictRecord, Report, AgentExecution
)
from backend.app.core.exceptions import SessionNotFoundException
from backend.app.core.logging import logger


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class SessionManager:
    """Central store for research sessions."""
    def __init__(self):
        self._sessions: Dict[str, ResearchSession] = {}
        self._cancellation_tokens: Dict[str, bool] = {}
        self._lock = asyncio.Lock()

    async def create_session(self, session: ResearchSession) -> ResearchSession:
        async with self._lock:
            self._sessions[session.session_id] = session
            self._cancellation_tokens[session.session_id] = False
        logger.info(f"Created research session: {session.session_id}")
        return session

    async def get_session(self, session_id: str) -> ResearchSession:
        async with self._lock:
            session = self._sessions.get(session_id)
        if not session:
            raise SessionNotFoundException(session_id)
        return session

    async def list_sessions(self, limit: int = 20) -> List[ResearchSession]:
        async with self._lock:
            sessions = list(self._sessions.values())
        # Sort descending by created_at
        sessions.sort(key=lambda s: s.created_at, reverse=True)
        return sessions[:limit]

    async def update_status(self, session_id: str, status: SessionStatus, error: Optional[str] = None):
        session = await self.get_session(session_id)
        session.status = status
        session.updated_at = utc_now()
        if error:
            session.error_message = error

    async def update_agent(self, session_id: str, agent: AgentExecution):
        session = await self.get_session(session_id)
        session.agents[agent.agent_id] = agent
        session.updated_at = utc_now()

    async def add_sources(self, session_id: str, sources: List[Source]):
        session = await self.get_session(session_id)
        existing_urls = {s.url for s in session.sources}
        for s in sources:
            if s.url not in existing_urls:
                session.sources.append(s)
                existing_urls.add(s.url)
        session.updated_at = utc_now()

    async def add_claims(self, session_id: str, claims: List[Claim]):
        session = await self.get_session(session_id)
        session.claims.extend(claims)
        session.updated_at = utc_now()

    async def add_conflicts(self, session_id: str, conflicts: List[ConflictRecord]):
        session = await self.get_session(session_id)
        session.conflicts.extend(conflicts)
        session.updated_at = utc_now()

    async def set_report(self, session_id: str, report: Report):
        session = await self.get_session(session_id)
        session.report = report
        session.status = SessionStatus.COMPLETED
        session.updated_at = utc_now()

    async def cancel_session(self, session_id: str) -> bool:
        session = await self.get_session(session_id)
        async with self._lock:
            self._cancellation_tokens[session_id] = True
        session.status = SessionStatus.CANCELLED
        session.updated_at = utc_now()
        logger.info(f"Session {session_id} marked as CANCELLED")
        return True

    def is_cancelled(self, session_id: str) -> bool:
        return self._cancellation_tokens.get(session_id, False)

    async def count_sessions(self) -> int:
        async with self._lock:
            return len(self._sessions)


session_manager = SessionManager()
