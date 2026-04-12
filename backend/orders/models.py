from django.db import models
from accounts.models import User
from vendors.models import FabricItem


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('ready', 'Ready'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    tailor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tailor_orders')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_orders')
    fabric = models.ForeignKey(FabricItem, on_delete=models.SET_NULL, null=True, blank=True)
    style_notes = models.TextField(blank=True)
    measurements = models.JSONField(default=dict, blank=True)
    deadline = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} — {self.client}"


class OrderMilestone(models.Model):
    STAGE_CHOICES = [
        ('cutting', 'Cutting'),
        ('sewing', 'Sewing'),
        ('fitting', 'Fitting'),
        ('finishing', 'Finishing'),
        ('ready', 'Ready'),
    ]
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='milestones')
    stage_name = models.CharField(max_length=20, choices=STAGE_CHOICES)
    is_complete = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.order} — {self.stage_name}"


class FabricRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('fulfilled', 'Fulfilled'),
    ]
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fabric_requests')
    vendor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_requests')
    fabric = models.ForeignKey(FabricItem, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Request #{self.id} — {self.fabric.name}"
