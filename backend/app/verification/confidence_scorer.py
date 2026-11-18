"""
VERITAS AI - Transparent Evidence Assessment & Confidence Engine
Calculates explainable confidence ratings based on authority, corroboration, recency, and directness.
Distinguished clearly from raw truth probability or arbitrary model scores.
"""

from datetime import datetime, timezone
from typing import List, Optional
from backend.app.models.contracts import Source, VerificationStatus

TYPE_WEIGHTS = {
    "peer_reviewed": 0.95,
    "official_doc": 0.95,
    "industry_report": 0.88,
    "news": 0.80,
    "web": 0.72,
    "preprint": 0.68
}


def calculate_recency_score(pub_date_str: Optional[str]) -> float:
    """Evaluates publication freshness (scale 0.7 - 1.0)."""
    if not pub_date_str:
        return 0.90  # Default neutral score for missing dates without fabricating
    try:
        parts = pub_date_str.split("-")
        year = int(parts[0])
        current_year = datetime.now(timezone.utc).year
        diff = max(0, current_year - year)
        if diff <= 1:
            return 1.0
        elif diff <= 3:
            return 0.95
        elif diff <= 5:
            return 0.88
        elif diff <= 10:
            return 0.78
        else:
            return 0.70
    except Exception:
        return 0.90


def compute_evidence_assessment(
    claim_text: str,
    status: VerificationStatus,
    supporting_sources: List[Source],
    contradicting_sources: List[Source]
) -> float:
    """
    Computes a transparent, mathematically grounded assessment metric between 0.0 and 1.0:
    Formula:
      Base Score = Average(Source Authority * Recency)
      Corroboration Factor = min(1.0, 0.85 + 0.15 * count(independent sources))
      Contradiction Penalty = Adjusts based on counterevidence authority
    """
    if status == VerificationStatus.UNVERIFIABLE or status == VerificationStatus.INSUFFICIENT_EVIDENCE:
        return 0.20

    if not supporting_sources and not contradicting_sources:
        return 0.15

    # 1. Authority & Recency of supporting sources
    if supporting_sources:
        scores = []
        for s in supporting_sources:
            auth = TYPE_WEIGHTS.get(s.source_type, 0.75)
            rec = calculate_recency_score(s.publication_date)
            scores.append(auth * rec)
        base_support = sum(scores) / len(scores)
    else:
        base_support = 0.30

    # 2. Corroboration boost for independent publishers
    publishers = {s.publisher.lower() for s in supporting_sources}
    corroboration = min(1.0, 0.85 + max(0, len(publishers) - 1) * 0.15)

    raw_score = base_support * corroboration

    # 3. Penalize if contradicted or partially supported
    if status == VerificationStatus.PARTIALLY_SUPPORTED:
        raw_score *= 0.75
    elif status == VerificationStatus.CONTRADICTED:
        if contradicting_sources:
            contra_auth = sum(TYPE_WEIGHTS.get(s.source_type, 0.75) for s in contradicting_sources) / len(contradicting_sources)
            raw_score = max(0.85, contra_auth)
        else:
            raw_score = 0.50

    return round(min(1.0, max(0.05, raw_score)), 2)
