"""
Unit Tests for the 6 Autonomous Specialized Agents.
"""

import pytest
from backend.app.models.contracts import ResearchSession, ResearchDomain, ResearchDepth, AgentStatus
from backend.app.agents.orchestrator import OrchestratorAgent
from backend.app.agents.researcher import ResearcherAgent
from backend.app.agents.verifier import VerifierAgent
from backend.app.agents.skeptic import SkepticAgent
from backend.app.agents.evidence_analyst import EvidenceAnalystAgent
from backend.app.agents.synthesis import SynthesisAgent


@pytest.mark.asyncio
async def test_all_six_agents_pipeline():
    session = ResearchSession(
        original_query="Is artificial intelligence replacing software developers, or is it increasing developer productivity?",
        domain=ResearchDomain.TECHNOLOGY,
        research_depth=ResearchDepth.STANDARD,
        maximum_sources=6
    )

    # 1. Orchestrator
    orchestrator = OrchestratorAgent()
    res1 = await orchestrator.run(session, "Decomposing query")
    assert session.agents["orchestrator"].status == AgentStatus.COMPLETED
    assert len(session.subquestions) >= 3

    # 2. Researcher
    researcher = ResearcherAgent()
    res2 = await researcher.run(session, "Searching sources")
    assert session.agents["researcher"].status == AgentStatus.COMPLETED
    assert len(session.sources) > 0
    assert len(session.claims) > 0

    # 3. Verifier
    verifier = VerifierAgent()
    res3 = await verifier.run(session, "Verifying claims")
    assert session.agents["verifier"].status == AgentStatus.COMPLETED
    assert all(c.verification_status is not None for c in session.claims)

    # 4. Skeptic
    skeptic = SkepticAgent()
    res4 = await skeptic.run(session, "Hunting counterevidence")
    assert session.agents["skeptic"].status == AgentStatus.COMPLETED

    # 5. Evidence Analyst
    evidence_analyst = EvidenceAnalystAgent()
    res5 = await evidence_analyst.run(session, "Analyzing provenance")
    assert session.agents["evidence_analyst"].status == AgentStatus.COMPLETED

    # 6. Synthesis Agent
    synthesis = SynthesisAgent()
    res6 = await synthesis.run(session, "Synthesizing report")
    assert session.agents["synthesis"].status == AgentStatus.COMPLETED
    assert session.report is not None
    assert len(session.report.findings) > 0
    assert session.report.evidence_score > 0.0
