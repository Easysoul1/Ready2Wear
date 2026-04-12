from rest_framework import serializers
from .models import VendorProfile, FabricItem, PriceHistory


class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = '__all__'


class FabricItemSerializer(serializers.ModelSerializer):
    price_history = PriceHistorySerializer(many=True, read_only=True)

    class Meta:
        model = FabricItem
        fields = '__all__'


class VendorProfileSerializer(serializers.ModelSerializer):
    fabrics = FabricItemSerializer(many=True, read_only=True)

    class Meta:
        model = VendorProfile
        fields = '__all__'
