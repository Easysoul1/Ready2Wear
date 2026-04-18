from rest_framework import serializers

from .models import TailorProfile


class TailorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TailorProfile
        fields = [
            'id',
            'user',
            'business_name',
            'specialisation',
            'location',
            'phone',
            'bio',
            'default_turnaround_days',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
