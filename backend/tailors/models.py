from django.core.exceptions import ValidationError
from django.db import models

from accounts.models import User


class TailorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tailor_profile')
    business_name = models.CharField(max_length=200)
    specialisation = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=30, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    default_turnaround_days = models.PositiveIntegerField(default=14)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        ordering = ['business_name']

    def clean(self):
        if self.user.role != User.Role.TAILOR:
            raise ValidationError('Tailor profile can only be attached to tailor users.')

    def __str__(self):
        return self.business_name
