import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fashionflow.settings')
django.setup()

from accounts.models import User
from accounts.password_utils import is_token_valid
from django.utils import timezone
import hashlib

for u in User.objects.exclude(reset_token_hash=''):
    print(f"User: {u.email}, Expiry: {u.reset_token_expiry}, Active: {u.is_active}, Hash: {u.reset_token_hash}")
