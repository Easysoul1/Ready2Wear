from rest_framework import serializers

from .models import ClientProfile


class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = [
            'id',
            'user',
            'phone',
            'address',
            'measurements',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
