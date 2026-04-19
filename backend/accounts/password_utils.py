import hashlib
import secrets
import os
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone


TOKEN_LENGTH = 32
TOKEN_EXPIRY_MINUTES = 30


def generate_reset_token():
    """Generate a cryptographically secure random token."""
    # Using hex ensures the token contains only alphanumeric characters,
    # preventing any potential url encoding or email markdown corruption.
    return secrets.token_hex(TOKEN_LENGTH)


def hash_token(token):
    """Hash a token using SHA-256 for storage."""
    return hashlib.sha256(token.encode()).hexdigest()


def get_token_expiry(minutes=TOKEN_EXPIRY_MINUTES):
    """Get expiry datetime for a token."""
    return timezone.now() + timedelta(minutes=minutes)


def is_token_valid(token, token_hash, expiry):
    """Validate that a token is not expired."""
    if not token_hash or not expiry:
        return False
    if hash_token(token) != token_hash:
        return False
    if timezone.now() > expiry:
        return False
    return True


def generate_password_reset_url(token, request=None):
    """Generate the full password reset URL."""
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    return f'{frontend_url}/auth/reset-password?token={token}'


def cleanup_expired_tokens(user):
    """Remove expired tokens from a user."""
    if user.reset_token_expiry and timezone.now() > user.reset_token_expiry:
        user.reset_token_hash = ''
        user.reset_token_expiry = None
        user.save(update_fields=['reset_token_hash', 'reset_token_expiry'])