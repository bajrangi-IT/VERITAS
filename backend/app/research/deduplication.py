"""
VERITAS AI - Source Normalization & Deduplication
Strips tracking query params, normalizes canonical domains, and removes duplicates.
"""

from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from typing import List, Set
from backend.app.models.contracts import Source

TRACKING_PARAMS = {
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    "fbclid", "gclid", "msclkid", "ref", "source", "ref_src"
}


def normalize_url(url: str) -> str:
    """Canonicalizes a URL by lowercasing scheme/host and stripping tracking parameters."""
    if not url:
        return ""
    try:
        parsed = urlparse(url.strip())
        scheme = parsed.scheme.lower()
        netloc = parsed.netloc.lower()
        if netloc.startswith("www."):
            netloc = netloc[4:]

        # Filter out tracking query parameters
        query_dict = parse_qs(parsed.query, keep_blank_values=False)
        cleaned_query = {k: v for k, v in query_dict.items() if k.lower() not in TRACKING_PARAMS}
        sorted_query = urlencode(cleaned_query, doseq=True)

        path = parsed.path.rstrip("/")
        if not path:
            path = "/"

        return urlunparse((scheme, netloc, path, "", sorted_query, ""))
    except Exception:
        return url.strip()


def deduplicate_sources(sources: List[Source]) -> List[Source]:
    """Filters duplicate and near-identical sources based on canonicalized URLs."""
    seen_urls: Set[str] = set()
    deduped: List[Source] = []

    for src in sources:
        canonical = normalize_url(src.url)
        if canonical not in seen_urls:
            seen_urls.add(canonical)
            deduped.append(src)

    return deduped
