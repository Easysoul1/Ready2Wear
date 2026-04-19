from rest_framework import serializers

from .models import CloudinaryImage, TailorProfile, TailorReadyMadeProduct


class CloudinaryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CloudinaryImage
        fields = ['id', 'public_id', 'url', 'secure_url', 'created_at']
        read_only_fields = ['id', 'created_at']


class TailorReadyMadeProductSerializer(serializers.ModelSerializer):
    images = CloudinaryImageSerializer(many=True, read_only=True)
    tailor_name = serializers.CharField(source='tailor.business_name', read_only=True)

    class Meta:
        model = TailorReadyMadeProduct
        fields = [
            'id', 'tailor', 'tailor_name', 'title', 'category', 'size_options',
            'price', 'fabric_used', 'description', 'images', 'is_available',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'tailor', 'created_at', 'updated_at']


class TailorReadyMadeProductCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    category = serializers.ChoiceField(choices=TailorReadyMadeProduct.Category.choices)
    size_options = serializers.ListField(child=serializers.CharField())
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    fabric_used = serializers.CharField(max_length=200)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)
    images = serializers.ListField(child=serializers.DictField(), required=False)


class TailorProfileSerializer(serializers.ModelSerializer):
    ready_made_products = TailorReadyMadeProductSerializer(many=True, read_only=True)

    class Meta:
        model = TailorProfile
        fields = [
            'id', 'user', 'business_name', 'specialisation', 'location',
            'phone', 'bio', 'default_turnaround_days', 'ready_made_products',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
