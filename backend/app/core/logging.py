"""
VERITAS AI - Structured Application Logging
Safe logging that suppresses secrets and sensitive credentials.
"""

import logging
import sys
import re

SENSITIVE_PATTERNS = [
    re.compile(r'(api[-_]?key|secret|token|password|authorization)=([^\s&]+)', re.IGNORECASE),
    re.compile(r'Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*', re.IGNORECASE),
]


class SanitizedFormatter(logging.Formatter):
    """Masks secret values and tokens from application logs."""
    def format(self, record: logging.LogRecord) -> str:
        orig = super().format(record)
        sanitized = orig
        for pattern in SENSITIVE_PATTERNS:
            sanitized = pattern.sub(r'\1=********', sanitized)
        return sanitized


def setup_logger(name: str = "veritas") -> logging.Logger:
    """Configures and returns a structured logger."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        formatter = SanitizedFormatter(
            fmt="%(asctime)s | %(levelname)-7s | %(name)s:%(funcName)s:%(lineno)d - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger


logger = setup_logger()
