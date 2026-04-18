from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from accounts.models import User


class VendorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vendor_profile')
    business_name = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True, default='')
    contact_phone = models.CharField(max_length=30, blank=True, default='')
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        ordering = ['business_name']

    def clean(self):
        if self.user.role != User.Role.VENDOR:
            raise ValidationError('Vendor profile can only be attached to vendor users.')

    def __str__(self):
        return self.business_name


class FabricItem(models.Model):
    class Unit(models.TextChoices):
        YARD = 'yard', 'Yard'
        METER = 'meter', 'Meter'
        PIECE = 'piece', 'Piece'

    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='fabrics')
    sku = models.CharField(max_length=64, null=True, blank=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    fabric_type = models.CharField(max_length=100)
    colour = models.CharField(max_length=100)
    unit = models.CharField(max_length=20, choices=Unit.choices, default=Unit.YARD)
    stock_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    low_stock_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=5)
    is_public = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(fields=['vendor', 'sku'], name='unique_fabric_sku_per_vendor'),
            models.CheckConstraint(condition=Q(stock_quantity__gte=0), name='fabric_stock_non_negative'),
            models.CheckConstraint(condition=Q(unit_price__gte=0), name='fabric_price_non_negative'),
            models.CheckConstraint(condition=Q(low_stock_threshold__gte=0), name='fabric_threshold_non_negative'),
        ]
        indexes = [
            models.Index(fields=['vendor', 'name']),
            models.Index(fields=['is_public', 'is_active']),
        ]

    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.low_stock_threshold

    def __str__(self):
        return f"{self.name} ({self.colour})"


class PriceHistory(models.Model):
    fabric = models.ForeignKey(FabricItem, on_delete=models.CASCADE, related_name='price_history')
    old_price = models.DecimalField(max_digits=10, decimal_places=2)
    new_price = models.DecimalField(max_digits=10, decimal_places=2)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='price_changes')
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-changed_at']

    def __str__(self):
        return f"{self.fabric.name}: {self.old_price} → {self.new_price}"


class InventoryEvent(models.Model):
    class EventType(models.TextChoices):
        STOCK_IN = 'stock_in', 'Stock In'
        STOCK_OUT = 'stock_out', 'Stock Out'
        ADJUSTMENT = 'adjustment', 'Adjustment'
        CHECKOUT = 'checkout', 'Marketplace Checkout'
        ORDER_ALLOCATION = 'order_allocation', 'Tailor Order Allocation'

    fabric = models.ForeignKey(FabricItem, on_delete=models.CASCADE, related_name='inventory_events')
    event_type = models.CharField(max_length=30, choices=EventType.choices)
    quantity_delta = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField(blank=True)
    reference = models.CharField(max_length=100, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='inventory_events')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(condition=~Q(quantity_delta=0), name='inventory_event_quantity_not_zero'),
        ]

    def __str__(self):
        return f'{self.fabric.name} {self.event_type} ({self.quantity_delta})'
