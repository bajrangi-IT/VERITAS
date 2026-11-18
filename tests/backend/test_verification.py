"""
Unit Tests for Fact Checking, Confidence Engine, and Contradiction Detection.
"""

from backend.app.models.contracts import Source, Claim, VerificationStatus
from backend.app.verification.fact_checker import FactChecker
from backend.app.verification.confidence_scorer import compute_evidence_assessment, calculate_recency_score
from backend.app.verification.contradiction_engine import ContradictionEngine


def test_recency_score_calculation():
    score_recent = calculate_recency_score("2024-01-01")
    score_old = calculate_recency_score("2010-01-01")
    assert score_recent > score_old
    assert score_recent >= 0.85


def test_fact_checker_classifies_supported():
    checker = FactChecker()
    src1 = Source(
        source_id="s1",
        title="MIT Study",
        url="https://mit.edu/study",
        publisher="MIT",
        publication_date="2024-05-10",
        source_type="peer_reviewed",
        content_excerpt="Completion times decreased by 40%."
    )
    src2 = Source(
        source_id="s2",
        title="Stanford Study",
        url="https://stanford.edu/study",
        publisher="Stanford",
        publication_date="2024-06-15",
        source_type="peer_reviewed",
        content_excerpt="Developer speed improved substantially."
    )
    claim = Claim(
        claim_id="c1",
        claim_text="AI tools speed up developer completion times",
        supporting_sources=["s1", "s2"]
    )

    verified = checker.verify_claims_against_sources([claim], [src1, src2])
    assert len(verified) == 1
    assert verified[0].verification_status == VerificationStatus.SUPPORTED
    assert verified[0].confidence_score > 0.70


def test_fact_checker_insufficient_evidence():
    checker = FactChecker()
    claim = Claim(
        claim_id="c2",
        claim_text="Quantum AI has replaced all human coders in 2024",
        supporting_sources=[],
        contradicting_sources=[]
    )
    verified = checker.verify_claims_against_sources([claim], [])
    assert verified[0].verification_status == VerificationStatus.INSUFFICIENT_EVIDENCE
    assert verified[0].confidence_score <= 0.25


def test_contradiction_engine_detects_discrepancies():
    engine = ContradictionEngine()
    s1 = Source(
        source_id="s1",
        title="Copilot Speed",
        url="https://arxiv.org/1",
        publisher="arXiv",
        content_excerpt="Developers completed tasks 55% faster."
    )
    s2 = Source(
        source_id="s2",
        title="GitClear Churn",
        url="https://gitclear.com/data",
        publisher="GitClear",
        content_excerpt="Code churn increased by 41% and code quality degraded."
    )
    conflicts = engine.analyze_discrepancies([s1, s2], [])
    assert len(conflicts) >= 1
    assert any("Velocity vs Long-term Code Reliability" in c.proposition for c in conflicts)
