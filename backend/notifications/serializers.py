from django.utils import timezone
from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'message',
            'notif_type',
            'channel',
            'payload',
            'delivery_status',
            'is_read',
            'read_at',
            'created_at',
            'sent_at',
        ]
        read_only_fields = [
            'id',
            'delivery_status',
            'read_at',
            'created_at',
            'sent_at',
        ]


class NotificationMarkReadSerializer(serializers.Serializer):
    is_read = serializers.BooleanField(default=True)

    def update(self, instance, validated_data):
        instance.is_read = validated_data['is_read']
        instance.read_at = timezone.now() if instance.is_read else None
        instance.save(update_fields=['is_read', 'read_at'])
        return instance
