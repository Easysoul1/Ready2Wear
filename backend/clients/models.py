from django.core.exceptions import ValidationError
from django.db import models

from accounts.models import User


class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    phone = models.CharField(max_length=20, blank=True, default='')
    address = models.TextField(blank=True, default='')
    measurements = models.JSONField(default=dict, blank=True)  # reusable baseline measurements
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def clean(self):
        if self.user.role != User.Role.CLIENT:
            raise ValidationError('Client profile can only be attached to client users.')

    def __str__(self):
        return self.user.get_full_name() or self.user.email
