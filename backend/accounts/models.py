from django.contrib.auth.models import AbstractUser, UserManager as DjangoUserManager
from django.db import models


class UserManager(DjangoUserManager):
    def _build_unique_username(self, raw_username):
        base_username = (raw_username or '').strip()
        if not base_username:
            base_username = 'user'
        candidate = base_username
        suffix = 1
        while self.model.objects.filter(username=candidate).exists():
            candidate = f'{base_username}_{suffix}'
            suffix += 1
        return candidate

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The email field must be set.')
        email = self.normalize_email(email)
        username = self._build_unique_username(extra_fields.get('username') or email.split('@')[0])
        extra_fields['username'] = username
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        VENDOR = 'vendor', 'Vendor'
        TAILOR = 'tailor', 'Tailor'
        CLIENT = 'client', 'Client'

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True, default='')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CLIENT, db_index=True)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']
    objects = UserManager()

    def __str__(self):
        return f'{self.email} ({self.role})'
