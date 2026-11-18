"""
VERITAS AI - Agent 3: Verifier
Cross-examines claims against empirical evidence records, assigning rigorous verification statuses.
"""

from typing import Any, Dict
from backend.app.agents.base import BaseAgent
from backend.app.models.contracts import ResearchSession
from backend.app.verification.fact_checker import FactChecker
from backend.app.models.events import StreamEvent, ResearchEventType
from backend.app.services.event_bus import event_bus


class VerifierAgent(BaseAgent):
    """Conducts rigorous claim-to-evidence cross verification."""
    def __init__(self, checker: FactChecker = None):
        super().__init__(agent_id="verifier", agent_name="Verifier Agent")
        self.checker = checker or FactChecker()

    async def process(self, session: ResearchSession) -> Dict[str, Any]:
        # Cross check all claims against gathered sources
        verified_claims = self.checker.verify_claims_against_sources(session.claims, session.sources)
        session.claims = verified_claims

        for claim in session.claims:
            await event_bus.publish(StreamEvent(
                event_type=ResearchEventType.CLAIM_VERIFIED,
                session_id=session.session_id,
                data={
                    "claim_id": claim.claim_id,
                    "status": claim.verification_status.value,
                    "confidence": claim.confidence_score,
                    "explanation": claim.explanation
                },
                message=f"Claim {claim.claim_id}: Status {claim.verification_status.value} (Confidence: {claim.confidence_score:.2f})"
            ))

        supported_count = sum(1 for c in session.claims if c.verification_status.value in ["SUPPORTED", "PARTIALLY_SUPPORTED"])
        contradicted_count = sum(1 for c in session.claims if c.verification_status.value == "CONTRADICTED")
        unverified_count = len(session.claims) - supported_count - contradicted_count

        summary = (
            f"Evaluated {len(session.claims)} claims: {supported_count} corroborated, "
            f"{contradicted_count} contradicted, and {unverified_count} inconclusive."
        )
        return {
            "supported": supported_count,
            "contradicted": contradicted_count,
            "unverified": unverified_count,
            "summary": summary
        }
