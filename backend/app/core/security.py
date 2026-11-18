"""
VERITAS AI - Network & Data Security Guards
Provides SSRF prevention, input sanitization, and safety checks.
"""

import ipaddress
import socket
from urllib.parse import urlparse
from backend.app.core.config import settings
from backend.app.core.exceptions import SSRFSecurityViolation

DISALLOWED_SCHEMES = {"file", "gopher", "ftp", "ldap", "dict", "data"}

# Disallowed private and special network ranges
PRIVATE_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),       # Loopback
    ipaddress.ip_network("10.0.0.0/8"),        # Private-Use
    ipaddress.ip_network("172.16.0.0/12"),     # Private-Use
    ipaddress.ip_network("192.168.0.0/16"),    # Private-Use
    ipaddress.ip_network("169.254.0.0/16"),    # Link-Local (Cloud metadata 169.254.169.254)
    ipaddress.ip_network("0.0.0.0/8"),         # Broadcast
    ipaddress.ip_network("::1/128"),           # IPv6 loopback
    ipaddress.ip_network("fc00::/7"),          # IPv6 Unique Local
    ipaddress.ip_network("fe80::/10"),         # IPv6 Link-Local
]


def is_safe_url(url: str) -> bool:
    """
    Validates that a URL does not point to internal, private, loopback,
    or cloud metadata endpoints (SSRF prevention).
    """
    if not url or not isinstance(url, str):
        return False

    try:
        parsed = urlparse(url.strip())
        if parsed.scheme.lower() not in {"http", "https"}:
            return False

        hostname = parsed.hostname
        if not hostname:
            return False

        # Reject obvious loopback and internal aliases
        lower_host = hostname.lower()
        if lower_host in {"localhost", "127.0.0.1", "0.0.0.0", "metadata.google.internal", "instance-data"}:
            return False

        if settings.ALLOW_PRIVATE_IPS:
            return True

        # Resolve hostname to IP to protect against DNS rebinding and IP notation tricks
        try:
            ip_info = socket.getaddrinfo(hostname, None, proto=socket.IPPROTO_TCP)
            for item in ip_info:
                ip_str = item[4][0]
                ip_obj = ipaddress.ip_address(ip_str)
                for private_net in PRIVATE_NETWORKS:
                    if ip_obj in private_net:
                        return False
        except (socket.gaierror, ValueError):
            # If domain fails DNS resolution, treat as untrusted
            return False

        return True
    except Exception:
        return False


def validate_and_sanitize_url(url: str) -> str:
    """Validates URL safety and raises SSRFSecurityViolation if unsafe."""
    if not is_safe_url(url):
        raise SSRFSecurityViolation(url)
    return url.strip()


def sanitize_input_text(text: str, max_length: int = 500) -> str:
    """Sanitizes user input to prevent prompt injections and control characters."""
    if not text:
        return ""
    # Strip dangerous non-printable control characters while preserving valid unicode
    cleaned = "".join(ch for ch in text if ch.isprintable() or ch in "\n\t")
    return cleaned.strip()[:max_length]
