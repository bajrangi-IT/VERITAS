"""
VERITAS AI - Fact Verification Engine
Verifies claims against source evidence with multi-status classification.
"""

from typing import List
from backend.app.models.contracts import Claim, Source, VerificationStatus
from backend.app.verification.confidence_scorer import compute_evidence_assessment


class FactChecker:
    """Verifies individual claims against extracted source excerpts."""

    def verify_claims_against_sources(self, claims: List[Claim], sources: List[Source]) -> List[Claim]:
        source_map = {s.source_id: s for s in sources}
        verified_claims: List[Claim] = []

        for claim in claims:
            supporting: List[Source] = [source_map[sid] for sid in claim.supporting_sources if sid in source_map]
            contradicting: List[Source] = [source_map[sid] for sid in claim.contradicting_sources if sid in source_map]

            # Dynamic classification based on evidence balance
            if supporting and not contradicting:
                # Check source depth
                if len(supporting) >= 2 or any(s.source_type == "peer_reviewed" for s in supporting):
                    status = VerificationStatus.SUPPORTED
                else:
                    status = VerificationStatus.PARTIALLY_SUPPORTED
            elif supporting and contradicting:
                status = VerificationStatus.PARTIALLY_SUPPORTED
            elif contradicting and not supporting:
                status = VerificationStatus.CONTRADICTED
            elif not supporting and not contradicting:
                status = VerificationStatus.INSUFFICIENT_EVIDENCE
            else:
                status = VerificationStatus.UNVERIFIABLE

            claim.verification_status = status
            claim.confidence_score = compute_evidence_assessment(
                claim.claim_text, status, supporting, contradicting
            )

            # Generate explainable methodology note
            pub_names = ", ".join(s.publisher for s in supporting) if supporting else "None"
            contra_names = ", ".join(s.publisher for s in contradicting) if contradicting else "None"
            claim.methodology_note = (
                f"Evaluated against {len(supporting)} supporting source(s) [{pub_names}] "
                f"and {len(contradicting)} contradicting source(s) [{contra_names}]. "
                f"Confidence metric: {claim.confidence_score:.2f}."
            )

            verified_claims.append(claim)

        return verified_claims
