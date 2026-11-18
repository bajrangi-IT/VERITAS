"""
VERITAS AI - Pydantic Data Contracts & Schemas
Enforces strict validation, typed interfaces, and domain models.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, HttpUrl, field_validator


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ResearchDepth(str, Enum):
    BRIEF = "brief"
    STANDARD = "standard"
    DEEP = "deep"


class ResearchDomain(str, Enum):
    GENERAL = "general"
    TECHNOLOGY = "technology"
    SCIENTIFIC = "scientific"
    GOVERNMENT = "government"
    CURRENT_AFFAIRS = "current_affairs"
    FINANCE = "finance"


class SessionStatus(str, Enum):
    QUEUED = "queued"
    INITIALIZING = "initializing"
    RESEARCHING = "researching"
    VERIFYING = "verifying"
    ANALYZING = "analyzing"
    SYNTHESIZING = "synthesizing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"


class VerificationStatus(str, Enum):
    SUPPORTED = "SUPPORTED"
    PARTIALLY_SUPPORTED = "PARTIALLY_SUPPORTED"
    CONTRADICTED = "CONTRADICTED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    UNVERIFIABLE = "UNVERIFIABLE"


class AgentStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class ResearchRequest(BaseModel):
    """Client request model for launching autonomous investigation."""
    query: str = Field(..., min_length=5, max_length=1000, description="The research question to investigate")
    domain: ResearchDomain = Field(default=ResearchDomain.GENERAL, description="Domain context for source weighting")
    research_depth: ResearchDepth = Field(default=ResearchDepth.STANDARD, description="Depth of agent decomposition")
    maximum_sources: int = Field(default=8, ge=2, le=25, description="Upper bound of external references")
    preferred_language: str = Field(default="en", max_length=10, description="Target language code")

    @field_validator("query")
    @classmethod
    def clean_query(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 5:
            raise ValueError("Research question must contain at least 5 meaningful characters.")
        return cleaned


class Source(BaseModel):
    """External evidence source record with provenance metadata."""
    source_id: str = Field(default_factory=lambda: str(uuid4())[:8])
    title: str
    url: str
    publisher: str
    publication_date: Optional[str] = None
    retrieved_at: datetime = Field(default_factory=utc_now)
    source_type: str = Field(default="web", description="peer_reviewed, news, official_doc, web, preprint")
    content_excerpt: str
    credibility_score: float = Field(default=0.8, ge=0.0, le=1.0)
    discovered_by_query: Optional[str] = None
    is_accessible: bool = True


class Claim(BaseModel):
    """Discrete factual proposition extracted and tested against evidence."""
    claim_id: str = Field(default_factory=lambda: str(uuid4())[:8])
    claim_text: str
    verification_status: VerificationStatus = VerificationStatus.INSUFFICIENT_EVIDENCE
    supporting_sources: List[str] = Field(default_factory=list, description="IDs of supporting sources")
    contradicting_sources: List[str] = Field(default_factory=list, description="IDs of conflicting sources")
    explanation: str = ""
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)
    methodology_note: Optional[str] = None


class ConflictRecord(BaseModel):
    """Detailed record of empirical disagreement or factual discrepancy."""
    conflict_id: str = Field(default_factory=lambda: str(uuid4())[:8])
    proposition: str
    side_a_assertion: str
    side_a_sources: List[str]
    side_b_assertion: str
    side_b_sources: List[str]
    conflict_type: str = Field(default="statistical_disparity", description="methodological, statistical, temporal, context_shift")
    explanation: str


class AgentExecution(BaseModel):
    """Auditable state and task trace for an individual autonomous agent."""
    agent_id: str
    agent_name: str
    status: AgentStatus = AgentStatus.IDLE
    task: str = ""
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    output_summary: Optional[str] = None
    error: Optional[str] = None


class Report(BaseModel):
    """Final synthesis report delivering verified intelligence."""
    report_id: str = Field(default_factory=lambda: str(uuid4())[:12])
    session_id: str
    executive_summary: str
    methodology: str
    findings: List[Dict[str, Any]]
    conflicts: List[ConflictRecord]
    limitations: List[str]
    bibliography: List[Source]
    generated_at: datetime = Field(default_factory=utc_now)
    evidence_score: float = Field(default=0.0, ge=0.0, le=1.0)


class ResearchSession(BaseModel):
    """Complete research session state representing the working memory."""
    session_id: str = Field(default_factory=lambda: str(uuid4()))
    original_query: str
    domain: ResearchDomain = ResearchDomain.GENERAL
    research_depth: ResearchDepth = ResearchDepth.STANDARD
    maximum_sources: int = 8
    status: SessionStatus = SessionStatus.QUEUED
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    subquestions: List[str] = Field(default_factory=list)
    agents: Dict[str, AgentExecution] = Field(default_factory=dict)
    sources: List[Source] = Field(default_factory=list)
    claims: List[Claim] = Field(default_factory=list)
    conflicts: List[ConflictRecord] = Field(default_factory=list)
    report: Optional[Report] = None
    error_message: Optional[str] = None


class SystemHealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    environment: str = "production"
    active_sessions: int = 0
    search_provider: str = "hybrid"
    llm_connected: bool = True
    timestamp: datetime = Field(default_factory=utc_now)
