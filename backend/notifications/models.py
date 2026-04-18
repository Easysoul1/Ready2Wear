from django.db import models

from accounts.models import User


class Notification(models.Model):
    class Type(models.TextChoices):
        ORDER_UPDATE = 'order_update', 'Order Update'
        DEADLINE = 'deadline', 'Deadline Reminder'
        LOW_STOCK = 'low_stock', 'Low Stock'
        MARKETPLACE = 'marketplace', 'Marketplace'
        GENERAL = 'general', 'General'

    class Channel(models.TextChoices):
        IN_APP = 'in_app', 'In-App'
        EMAIL = 'email', 'Email'
        SMS = 'sms', 'SMS'
        PUSH = 'push', 'Push'

    class DeliveryStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SENT = 'sent', 'Sent'
        FAILED = 'failed', 'Failed'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255, default='Notification')
    message = models.TextField()
    notif_type = models.CharField(max_length=30, choices=Type.choices, default=Type.GENERAL)
    channel = models.CharField(max_length=20, choices=Channel.choices, default=Channel.IN_APP)
    payload = models.JSONField(default=dict, blank=True)
    delivery_status = models.CharField(max_length=20, choices=DeliveryStatus.choices, default=DeliveryStatus.PENDING)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['notif_type', 'delivery_status']),
        ]

    def __str__(self):
        return f'[{self.notif_type}] {self.user.email}'
