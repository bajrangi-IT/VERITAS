"""
VERITAS AI - Structured Application Logging
Safe logging that suppresses secrets and sensitive credentials.
"""

import logging
import sys
import re

class SanitizedFormatter(logging.Formatter):
    """Masks secret values and tokens from application logs."""
    def format(self, record: logging.LogRecord) -> str:
        orig = super().format(record)
        sanitized = re.sub(
            r'(api[-_]?key|secret|token|password|authorization)=([^\s&]+)',
            r'\1=********',
            orig,
            flags=re.IGNORECASE
        )
        sanitized = re.sub(
            r'Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*',
            'Bearer ********',
            sanitized,
            flags=re.IGNORECASE
        )
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
