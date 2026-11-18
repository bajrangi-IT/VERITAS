"""
VERITAS AI - Domain & HTTP Exceptions
Safe error reporting without leaking internal implementation details.
"""

from typing import Any, Optional
from fastapi import HTTPException, status


class VeritasException(Exception):
    """Base exception for all VERITAS domain errors."""
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message)
        self.message = message
        self.details = details


class SessionNotFoundException(HTTPException):
    def __init__(self, session_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Research session '{session_id}' was not found."
        )


class InvalidResearchRequestException(HTTPException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=message
        )


class SSRFSecurityViolation(HTTPException):
    def __init__(self, url: str):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access to URL target '{url}' is restricted by network security policy."
        )


class ProviderUnavailableException(HTTPException):
    def __init__(self, provider: str, reason: str = "Unavailable"):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"External search or intelligence provider '{provider}' is currently unreachable: {reason}"
        )
