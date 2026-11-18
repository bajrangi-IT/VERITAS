"""
VERITAS AI - Agent 2: Researcher
Retrieves external evidence, extracts candidate factual claims, and preserves source provenance.
"""

from typing import Any, Dict, List
from backend.app.agents.base import BaseAgent
from backend.app.models.contracts import ResearchSession, Source, Claim
from backend.app.research.engine import ResearchEngine
from backend.app.models.events import StreamEvent, ResearchEventType
from backend.app.services.event_bus import event_bus


class ResearcherAgent(BaseAgent):
    """Executes parallel information retrieval and extracts candidate empirical propositions."""
    def __init__(self, engine: ResearchEngine = None):
        super().__init__(agent_id="researcher", agent_name="Researcher Agent")
        self.engine = engine or ResearchEngine()

    async def process(self, session: ResearchSession) -> Dict[str, Any]:
        # 1. Retrieve evidence sources
        sources: List[Source] = await self.engine.execute_research(
            query=session.original_query,
            domain=session.domain,
            depth=session.research_depth,
            max_sources=session.maximum_sources
        )
        session.sources = sources

        # Broadcast each discovered source
        for src in sources:
            await event_bus.publish(StreamEvent(
                event_type=ResearchEventType.SOURCE_DISCOVERED,
                session_id=session.session_id,
                data={
                    "source_id": src.source_id,
                    "title": src.title,
                    "publisher": src.publisher,
                    "url": src.url,
                    "credibility": src.credibility_score
                },
                message=f"Discovered evidence source from {src.publisher}: '{src.title[:50]}...'"
            ))

        # 2. Extract candidate propositions: Primary proposition is ALWAYS the user's inquiry
        candidate_claims: List[Claim] = [
            Claim(
                claim_text=session.original_query,
                supporting_sources=[],
                contradicting_sources=[],
                explanation="Primary research proposition under empirical investigation."
            )
        ]
        for src in sources:
            text = src.content_excerpt
            # Extract key declarative sentences as candidate propositions
            sentences = [s.strip() for s in text.split(". ") if len(s.strip()) > 35]
            if sentences:
                claim_text = sentences[0]
                if claim_text.lower() != session.original_query.lower():
                    candidate_claims.append(Claim(
                        claim_text=claim_text,
                        supporting_sources=[src.source_id],
                        explanation=f"Contextual documentation from {src.publisher}."
                    ))

        session.claims = candidate_claims[:8]

        for claim in session.claims:
            await event_bus.publish(StreamEvent(
                event_type=ResearchEventType.CLAIM_EXTRACTED,
                session_id=session.session_id,
                data={"claim_id": claim.claim_id, "text": claim.claim_text},
                message=f"Extracted proposition: '{claim.claim_text[:60]}...'"
            ))

        summary = (
            f"Collected {len(sources)} deduplicated sources across {len(set(s.publisher for s in sources))} distinct publishers. "
            f"Identified {len(session.claims)} empirical propositions for verification."
        )
        return {"sources_count": len(sources), "claims_count": len(session.claims), "summary": summary}
