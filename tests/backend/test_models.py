"""
Unit Tests for Pydantic Data Contracts and Validations.
"""

import pytest
from pydantic import ValidationError
from backend.app.models.contracts import (
    ResearchRequest, ResearchDepth, ResearchDomain, Source, Claim, VerificationStatus, Report
)


def test_research_request_validation():
    req = ResearchRequest(
        query="Is artificial intelligence replacing software developers?",
        domain=ResearchDomain.TECHNOLOGY,
        research_depth=ResearchDepth.STANDARD,
        maximum_sources=6
    )
    assert req.query.startswith("Is artificial")
    assert req.domain == ResearchDomain.TECHNOLOGY
    assert req.maximum_sources == 6


def test_research_request_rejects_empty_query():
    with pytest.raises(ValidationError):
        ResearchRequest(query="   ")


def test_research_request_rejects_excessive_sources():
    with pytest.raises(ValidationError):
        ResearchRequest(query="Valid query text here", maximum_sources=100)


def test_source_model_defaults():
    src = Source(
        title="Test Study",
        url="https://example.com/study",
        publisher="Test Institute",
        content_excerpt="Empirical findings show 50% improvement."
    )
    assert src.source_id is not None
    assert src.credibility_score == 0.8
    assert src.is_accessible is True


def test_claim_model_verification_statuses():
    claim = Claim(
        claim_text="AI increases developer productivity by 55%",
        verification_status=VerificationStatus.SUPPORTED,
        supporting_sources=["src-1", "src-2"],
        confidence_score=0.92
    )
    assert claim.verification_status == VerificationStatus.SUPPORTED
    assert len(claim.supporting_sources) == 2
    assert claim.confidence_score == 0.92
