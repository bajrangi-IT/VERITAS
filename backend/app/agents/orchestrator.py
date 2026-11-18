"""
VERITAS AI - Agent 1: Orchestrator
Coordinates multi-agent research workflow, inquiry decomposition, and execution dependencies.
"""

from typing import Any, Dict
from backend.app.agents.base import BaseAgent
from backend.app.models.contracts import ResearchSession, ResearchDomain
from backend.app.research.engine import ResearchEngine
from backend.app.models.events import StreamEvent, ResearchEventType
from backend.app.services.event_bus import event_bus


class OrchestratorAgent(BaseAgent):
    """Orchestrates query decomposition, task sequencing, and agent coordination."""
    def __init__(self, engine: ResearchEngine = None):
        super().__init__(agent_id="orchestrator", agent_name="Orchestrator Agent")
        self.engine = engine or ResearchEngine()

    async def process(self, session: ResearchSession) -> Dict[str, Any]:
        # 1. Domain context identification (only auto-detect if general)
        if session.domain == ResearchDomain.GENERAL:
            query_lower = session.original_query.lower()
            if any(w in query_lower for w in ["ai", "software", "code", "developer", "algorithm", "tech", "computer"]):
                session.domain = ResearchDomain.TECHNOLOGY
            elif any(w in query_lower for w in ["study", "trial", "physics", "biology", "vaccine", "climate", "mars", "space", "water", "health", "fasting", "diet"]):
                session.domain = ResearchDomain.SCIENTIFIC
            elif any(w in query_lower for w in ["law", "policy", "government", "regulation", "bill", "president", "court"]):
                session.domain = ResearchDomain.GOVERNMENT

        # 2. Decompose question into targeted subqueries
        subquestions = self.engine.decompose_query(session.original_query, session.research_depth)
        session.subquestions = subquestions

        await event_bus.publish(StreamEvent(
            event_type=ResearchEventType.QUERY_DECOMPOSED,
            session_id=session.session_id,
            data={"domain": session.domain.value, "subquestions": subquestions},
            message=f"Decomposed investigation into {len(subquestions)} targeted analytical tracks"
        ))

        summary = (
            f"Classified inquiry domain as '{session.domain.value}'. "
            f"Generated {len(subquestions)} investigative sub-tracks for multi-agent execution."
        )
        return {"subquestions": subquestions, "domain": session.domain.value, "summary": summary}
