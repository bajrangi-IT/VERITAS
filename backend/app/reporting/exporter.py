"""
VERITAS AI - Report Generation & Formatting Service
Formats research results into clean printable HTML and structured Markdown for export.
"""

from backend.app.models.contracts import Report, ResearchSession


def generate_markdown_report(session: ResearchSession) -> str:
    """Renders a comprehensive, publication-ready Markdown intelligence dossier."""
    report = session.report
    if not report:
        return f"# VERITAS AI Report\n\nSession {session.session_id} is currently in progress."

    lines = [
        f"# VERITAS AI — Intelligence Dossier",
        f"**Research Target**: {session.original_query}",
        f"**Session ID**: `{session.session_id}` | **Date**: {report.generated_at.strftime('%Y-%m-%d %H:%M UTC')}",
        f"**Evidential Integrity Score**: {report.evidence_score:.2f} / 1.00",
        "",
        "---",
        "",
        "## 1. Executive Summary",
        report.executive_summary,
        "",
        "## 2. Methodology & Analytical Scope",
        report.methodology,
        "",
        "## 3. Key Evidential Findings",
    ]

    for idx, item in enumerate(report.findings, 1):
        lines.append(f"### Finding {idx}: {item.get('topic', 'General')}")
        lines.append(f"- **Conclusion**: {item.get('finding')}")
        lines.append(f"- **Verification Status**: `{item.get('supported_status')}`")
        lines.append("")

    lines.extend([
        "## 4. Claim Verification Matrix",
        "| ID | Proposition | Status | Confidence | Citations |",
        "|---|---|---|---|---|"
    ])

    for claim in session.claims:
        status_badge = claim.verification_status.value
        cites = ", ".join(f"[{sid}](#source-{sid})" for sid in claim.supporting_sources) or "None"
        lines.append(f"| {claim.claim_id} | {claim.claim_text[:60]}... | `{status_badge}` | {claim.confidence_score:.2f} | {cites} |")

    lines.append("")
    lines.append("## 5. Empirical Contradictions & Discrepancies")
    if session.conflicts:
        for idx, conf in enumerate(session.conflicts, 1):
            lines.append(f"### Discrepancy {idx}: {conf.proposition} ({conf.conflict_type})")
            lines.append(f"- **Position A**: {conf.side_a_assertion}")
            lines.append(f"- **Position B**: {conf.side_b_assertion}")
            lines.append(f"- **Analytical Resolution**: {conf.explanation}")
            lines.append("")
    else:
        lines.append("No unresolved empirical contradictions detected across the evaluated source corpus.")
        lines.append("")

    lines.append("## 6. Analytical Limitations")
    for lim in report.limitations:
        lines.append(f"- {lim}")

    lines.append("")
    lines.append("## 7. Verified Source Bibliography")
    for src in session.sources:
        lines.append(f"- <a id='source-{src.source_id}'></a>**[{src.publisher}]** [{src.title}]({src.url}) (Retrieved: {src.publication_date or 'Recent'})")
        lines.append(f"  > *\"{src.content_excerpt[:200]}...\"*")

    return "\n".join(lines)
