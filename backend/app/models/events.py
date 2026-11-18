"""
VERITAS AI - Real-time SSE Event Models
Defines typed message structures for live streaming UI updates.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ResearchEventType(str, Enum):
    RESEARCH_STARTED = "research_started"
    QUERY_DECOMPOSED = "query_decomposed"
    AGENT_STARTED = "agent_started"
    AGENT_PROGRESS = "agent_progress"
    SOURCE_DISCOVERED = "source_discovered"
    CLAIM_EXTRACTED = "claim_extracted"
    CLAIM_VERIFIED = "claim_verified"
    CONFLICT_DETECTED = "conflict_detected"
    AGENT_COMPLETED = "agent_completed"
    RESEARCH_COMPLETED = "research_completed"
    RESEARCH_FAILED = "research_failed"
    RESEARCH_CANCELLED = "research_cancelled"


class StreamEvent(BaseModel):
    """Event wrapper emitted through Server-Sent Events (SSE)."""
    event_type: ResearchEventType
    session_id: str
    timestamp: datetime = Field(default_factory=utc_now)
    data: Dict[str, Any] = Field(default_factory=dict)
    message: str = ""

    def to_sse_payload(self) -> str:
        """Converts event to SSE json string."""
        import json
        return json.dumps({
            "event_type": self.event_type.value,
            "session_id": self.session_id,
            "timestamp": self.timestamp.isoformat(),
            "data": self.data,
            "message": self.message
        })
