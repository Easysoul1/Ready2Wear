from django.core.exceptions import ValidationError
from django.db import models

from accounts.models import User


class CloudinaryImage(models.Model):
    """Reusable Cloudinary image model."""
    public_id = models.CharField(max_length=255)
    url = models.URLField(max_length=500)
    secure_url = models.URLField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.public_id


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


class TailorReadyMadeProduct(models.Model):
    """Ready-made products from tailors (dresses, agbadas, gowns)."""

    class Category(models.TextChoices):
        WOMENS = 'womens', "Women's"
        MENS = 'mens', "Men's"
        UNISEX = 'unisex', 'Unisex'

    class SizeOption(models.TextChoices):
        XS = 'xs', 'XS'
        S = 's', 'S'
        M = 'm', 'M'
        L = 'l', 'L'
        XL = 'xl', 'XL'
        XXL = 'xxl', 'XXL'
        CUSTOM = 'custom', 'Custom'

    tailor = models.ForeignKey(
        TailorProfile,
        on_delete=models.CASCADE,
        related_name='ready_made_products'
    )
    title = models.CharField(
        max_length=200,
        help_text="e.g., Ready-made sequin gown"
    )
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        help_text="Who is this for?"
    )
    size_options = models.JSONField(
        default=list,
        help_text="Available sizes: ['S', 'M', 'L', 'XL']"
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    fabric_used = models.CharField(
        max_length=200,
        help_text="What fabric was used? e.g., Silk, Lace"
    )
    description = models.TextField(
        max_length=500,
        blank=True,
        help_text="Describe the item – e.g., 'Elegant sequin gown, perfect for parties.'"
    )
    images = models.ManyToManyField(
        CloudinaryImage,
        blank=True,
        related_name='tailor_products'
    )
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} by {self.tailor.user.full_name}"
