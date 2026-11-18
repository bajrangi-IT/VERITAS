"""
VERITAS AI - Multi-Agent Workflow Coordinator
Manages sequential and parallel handoffs between the 6 specialized AI agents.
"""

from typing import Optional
from backend.app.models.contracts import ResearchSession, SessionStatus
from backend.app.models.events import StreamEvent, ResearchEventType
from backend.app.services.session_manager import session_manager
from backend.app.services.event_bus import event_bus
from backend.app.agents.orchestrator import OrchestratorAgent
from backend.app.agents.researcher import ResearcherAgent
from backend.app.agents.verifier import VerifierAgent
from backend.app.agents.skeptic import SkepticAgent
from backend.app.agents.evidence_analyst import EvidenceAnalystAgent
from backend.app.agents.synthesis import SynthesisAgent
from backend.app.core.logging import logger


class ResearchCoordinator:
    """Coordinates execution across all 6 autonomous agents."""
    def __init__(self):
        self.orchestrator = OrchestratorAgent()
        self.researcher = ResearcherAgent()
        self.verifier = VerifierAgent()
        self.skeptic = SkepticAgent()
        self.evidence_analyst = EvidenceAnalystAgent()
        self.synthesis = SynthesisAgent()

    async def execute_investigation(self, session_id: str):
        """Runs the full autonomous research pipeline for a session."""
        session = await session_manager.get_session(session_id)
        logger.info(f"Initiating research investigation for session: {session_id}")

        await event_bus.publish(StreamEvent(
            event_type=ResearchEventType.RESEARCH_STARTED,
            session_id=session_id,
            data={"query": session.original_query, "domain": session.domain.value},
            message=f"Investigation started for: '{session.original_query}'"
        ))

        try:
            # 1. Orchestrator
            if session_manager.is_cancelled(session_id):
                return
            await session_manager.update_status(session_id, SessionStatus.INITIALIZING)
            await self.orchestrator.run(session, "Analyzing inquiry intent and decomposing analytical tracks")

            # 2. Researcher
            if session_manager.is_cancelled(session_id):
                return
            await session_manager.update_status(session_id, SessionStatus.RESEARCHING)
            await self.researcher.run(session, "Querying search index, gathering source excerpts, and extracting claims")

            # 3. Verifier
            if session_manager.is_cancelled(session_id):
                return
            await session_manager.update_status(session_id, SessionStatus.VERIFYING)
            await self.verifier.run(session, "Verifying candidate factual propositions against source citations")

            # 4. Skeptic
            if session_manager.is_cancelled(session_id):
                return
            await session_manager.update_status(session_id, SessionStatus.ANALYZING)
            await self.skeptic.run(session, "Probing counterevidence, statistical discrepancies, and missing context")

            # 5. Evidence Analyst
            if session_manager.is_cancelled(session_id):
                return
            await self.evidence_analyst.run(session, "Auditing provenance, publisher independence, and evidentiary metrics")

            # 6. Synthesis Agent
            if session_manager.is_cancelled(session_id):
                return
            await session_manager.update_status(session_id, SessionStatus.SYNTHESIZING)
            await self.synthesis.run(session, "Harmonizing agent intelligence into final verified executive report")

            await session_manager.update_status(session_id, SessionStatus.COMPLETED)
            logger.info(f"Research pipeline successfully completed for session: {session_id}")

        except Exception as exc:
            logger.error(f"Fatal research execution failure in session {session_id}: {str(exc)}", exc_info=True)
            await session_manager.update_status(session_id, SessionStatus.FAILED, error=str(exc))
            await event_bus.publish(StreamEvent(
                event_type=ResearchEventType.RESEARCH_FAILED,
                session_id=session_id,
                data={"error": str(exc)},
                message=f"Research failed: {str(exc)}"
            ))


coordinator = ResearchCoordinator()
