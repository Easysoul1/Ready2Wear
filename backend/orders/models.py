from decimal import Decimal
from uuid import uuid4

from django.db import models
from django.db.models import Q

from accounts.models import User
from vendors.models import FabricItem


def generate_order_number():
    return f'ORD-{uuid4().hex[:12].upper()}'


class Order(models.Model):
    class Stage(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CUTTING = 'cutting', 'Cutting'
        SEWING = 'sewing', 'Sewing'
        FINISHING = 'finishing', 'Finishing'
        READY = 'ready', 'Ready'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    order_number = models.CharField(max_length=24, unique=True, editable=False, default=generate_order_number)
    tailor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tailor_orders')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_orders')
    selected_fabric = models.ForeignKey(FabricItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='tailor_orders')
    title = models.CharField(max_length=200, default='Custom Outfit')
    style_notes = models.TextField(blank=True)
    total_estimate = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    deadline = models.DateField()
    expected_delivery = models.DateField(null=True, blank=True)
    current_stage = models.CharField(max_length=20, choices=Stage.choices, default=Stage.PENDING, db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE, db_index=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_orders')
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tailor', 'deadline']),
            models.Index(fields=['client', 'current_stage']),
            models.Index(fields=['status', 'current_stage']),
        ]

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f'ORD-{uuid4().hex[:12].upper()}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.order_number} ({self.client.email})'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    fabric = models.ForeignKey(FabricItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='order_items')
    description = models.CharField(max_length=255, blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=Q(quantity__gt=0), name='order_item_quantity_positive'),
            models.CheckConstraint(condition=Q(unit_price__gte=0), name='order_item_unit_price_non_negative'),
            models.CheckConstraint(condition=Q(line_total__gte=0), name='order_item_line_total_non_negative'),
        ]

    def save(self, *args, **kwargs):
        self.line_total = Decimal(self.quantity) * Decimal(self.unit_price)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.order.order_number} item #{self.pk}'


class OrderMeasurement(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='measurement')
    measurements = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True)
    captured_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='captured_measurements')
    captured_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Measurements for {self.order.order_number}'


class OrderProgressLog(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='progress_logs')
    stage = models.CharField(max_length=20, choices=Order.Stage.choices)
    message = models.TextField(blank=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='order_progress_logs')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.order.order_number} -> {self.stage}'
