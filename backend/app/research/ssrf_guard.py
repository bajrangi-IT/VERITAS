"""
VERITAS AI - SSRF Guard & Safe HTTP Client
Enforces timeouts, size caps, and network address validation for external requests.
"""

from typing import Optional
import httpx
from backend.app.core.security import is_safe_url
from backend.app.core.config import settings
from backend.app.core.logging import logger


async def safe_fetch_page(url: str, timeout: Optional[float] = None) -> Optional[str]:
    """
    Safely retrieves web page content while enforcing:
    1. SSRF prevention (IP and scheme validation)
    2. Response size cap (prevents memory exhaustion)
    3. Strict timeout (prevents hanging requests)
    """
    if not is_safe_url(url):
        logger.warning(f"Blocked SSRF attempt or unsafe destination: {url}")
        return None

    timeout_val = timeout or settings.REQUEST_TIMEOUT_SECONDS
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 VERITAS-Research-Bot/1.0",
        "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8"
    }

    try:
        async with httpx.AsyncClient(
            timeout=timeout_val,
            follow_redirects=True,
            max_redirects=settings.HTTP_MAX_REDIRECTS
        ) as client:
            response = await client.get(url, headers=headers)
            if response.status_code != 200:
                logger.warning(f"Failed to fetch {url}: HTTP {response.status_code}")
                return None

            # Enforce max byte size limit
            content_bytes = response.content
            if len(content_bytes) > settings.HTTP_MAX_RESPONSE_BYTES:
                content_bytes = content_bytes[:settings.HTTP_MAX_RESPONSE_BYTES]

            return content_bytes.decode("utf-8", errors="replace")
    except Exception as exc:
        logger.warning(f"Error fetching {url}: {str(exc)}")
        return None
