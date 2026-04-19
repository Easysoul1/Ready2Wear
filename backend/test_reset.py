import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fashionflow.settings')
django.setup()

from accounts.models import User
from accounts.password_utils import generate_reset_token, hash_token, generate_password_reset_url
from django.utils import timezone

# Create a test user
user, created = User.objects.get_or_create(email='test@example.com', defaults={'full_name': 'Test User', 'username': 'testuser', 'password': 'password123'})
print(f"User created: {created}, ID: {user.id}")

tk = generate_reset_token()
print("TOKEN:", tk)
print("URL:", generate_password_reset_url(tk))

print("Is token valid?", hash_token(tk) == hash_token(tk))

