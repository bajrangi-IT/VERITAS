"""
Unit Tests for Security, SSRF Prevention, and Input Sanitization.
"""

from backend.app.core.security import is_safe_url, sanitize_input_text


def test_ssrf_blocks_localhost():
    assert not is_safe_url("http://localhost:8080/admin")
    assert not is_safe_url("http://127.0.0.1/secret")
    assert not is_safe_url("http://127.0.0.2:9000")


def test_ssrf_blocks_private_ranges():
    assert not is_safe_url("http://10.0.0.1/internal")
    assert not is_safe_url("http://192.168.1.1/router")
    assert not is_safe_url("http://172.16.0.1/db")


def test_ssrf_blocks_cloud_metadata():
    assert not is_safe_url("http://169.254.169.254/latest/meta-data/")
    assert not is_safe_url("http://metadata.google.internal/computeMetadata/v1/")


def test_ssrf_blocks_invalid_schemes():
    assert not is_safe_url("file:///etc/passwd")
    assert not is_safe_url("gopher://127.0.0.1:70")
    assert not is_safe_url("ftp://ftp.example.com")


def test_ssrf_allows_public_https_domains():
    assert is_safe_url("https://economics.mit.edu/paper.pdf")
    assert is_safe_url("https://arxiv.org/abs/2302.06590")
    assert is_safe_url("https://www.mckinsey.com/insights")


def test_sanitize_input_text():
    raw = "Valid inquiry\x00\x08 with dangerous control chars"
    sanitized = sanitize_input_text(raw)
    assert "\x00" not in sanitized
    assert "\x08" not in sanitized
    assert "Valid inquiry" in sanitized
