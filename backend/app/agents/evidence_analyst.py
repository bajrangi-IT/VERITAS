"""
VERITAS AI - Agent 5: Evidence Analyst
Maps evidence graphs, measures institutional credibility, evaluates corroboration, and weights claims.
"""

from typing import Any, Dict
from backend.app.agents.base import BaseAgent
from backend.app.models.contracts import ResearchSession


class EvidenceAnalystAgent(BaseAgent):
    """Deep-dives into source provenance, independence, and evidential weighting."""
    def __init__(self):
        super().__init__(agent_id="evidence_analyst", agent_name="Evidence Analyst Agent")

    async def process(self, session: ResearchSession) -> Dict[str, Any]:
        total_sources = len(session.sources)
        if total_sources == 0:
            return {"summary": "No sources available for provenance analysis."}

        peer_reviewed = sum(1 for s in session.sources if s.source_type == "peer_reviewed")
        official_docs = sum(1 for s in session.sources if s.source_type == "official_doc")
        industry_reports = sum(1 for s in session.sources if s.source_type == "industry_report")

        # Calculate systemic evidential integrity index
        avg_credibility = sum(s.credibility_score for s in session.sources) / total_sources
        unique_publishers = len(set(s.publisher.lower() for s in session.sources))
        independence_ratio = unique_publishers / total_sources if total_sources > 0 else 0.0

        composite_integrity = round((avg_credibility * 0.6) + (independence_ratio * 0.4), 2)

        summary = (
            f"Provenance Audit: {peer_reviewed} peer-reviewed studies, {official_docs} official government reports, "
            f"and {industry_reports} industry benchmarks. Publisher independence ratio: {independence_ratio:.0%}. "
            f"Systemic evidential integrity index: {composite_integrity}."
        )
        return {
            "peer_reviewed_count": peer_reviewed,
            "official_docs_count": official_docs,
            "independence_ratio": independence_ratio,
            "composite_integrity": composite_integrity,
            "summary": summary
        }
