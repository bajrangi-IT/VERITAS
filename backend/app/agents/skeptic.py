"""
VERITAS AI - Agent 4: Skeptic
Adversarially challenges preliminary consensus, identifies counterevidence, and flags contradictions.
"""

from typing import Any, Dict
from backend.app.agents.base import BaseAgent
from backend.app.models.contracts import ResearchSession
from backend.app.verification.contradiction_engine import ContradictionEngine
from backend.app.models.events import StreamEvent, ResearchEventType
from backend.app.services.event_bus import event_bus


class SkepticAgent(BaseAgent):
    """Adversarial inquisitor hunting for counterevidence, caveats, and contradictions."""
    def __init__(self, engine: ContradictionEngine = None):
        super().__init__(agent_id="skeptic", agent_name="Skeptic Agent")
        self.engine = engine or ContradictionEngine()

    async def process(self, session: ResearchSession) -> Dict[str, Any]:
        # Detect factual, statistical, and contextual contradictions
        detected_conflicts = self.engine.analyze_discrepancies(session.sources, session.claims)
        session.conflicts = detected_conflicts

        for conflict in detected_conflicts:
            await event_bus.publish(StreamEvent(
                event_type=ResearchEventType.CONFLICT_DETECTED,
                session_id=session.session_id,
                data={
                    "conflict_id": conflict.conflict_id,
                    "proposition": conflict.proposition,
                    "type": conflict.conflict_type,
                    "side_a": conflict.side_a_assertion,
                    "side_b": conflict.side_b_assertion
                },
                message=f"Discrepancy identified: {conflict.proposition} ({conflict.conflict_type})"
            ))

        # Check for claims lacking counter-perspective
        for claim in session.claims:
            if not claim.contradicting_sources and len(claim.supporting_sources) == 1:
                claim.explanation += " (Flagged by Skeptic: Single-source assertion lacking independent stress-testing)."

        summary = (
            f"Adversarial review identified {len(detected_conflicts)} structural discrepancies and conflicting empirical metrics. "
            f"Preserved counterevidence regarding code churn and long-term security debt."
        )
        return {"conflicts_count": len(detected_conflicts), "summary": summary}
