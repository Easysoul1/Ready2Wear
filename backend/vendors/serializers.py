from rest_framework import serializers

from .models import FabricItem, InventoryEvent, PriceHistory, VendorProfile


class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = ['id', 'old_price', 'new_price', 'changed_by', 'changed_at']
        read_only_fields = ['id', 'changed_by', 'changed_at']


class InventoryEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryEvent
        fields = [
            'id',
            'event_type',
            'quantity_delta',
            'reason',
            'reference',
            'created_by',
            'created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at']


class FabricItemSerializer(serializers.ModelSerializer):
    price_history = PriceHistorySerializer(many=True, read_only=True)
    inventory_events = InventoryEventSerializer(many=True, read_only=True)
    vendor_business_name = serializers.CharField(source='vendor.business_name', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = FabricItem
        fields = [
            'id',
            'vendor',
            'vendor_business_name',
            'sku',
            'name',
            'description',
            'fabric_type',
            'colour',
            'unit',
            'stock_quantity',
            'unit_price',
            'low_stock_threshold',
            'is_public',
            'is_active',
            'is_low_stock',
            'price_history',
            'inventory_events',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'vendor',
            'is_low_stock',
            'price_history',
            'inventory_events',
            'created_at',
            'updated_at',
        ]


class VendorProfileSerializer(serializers.ModelSerializer):
    fabrics = FabricItemSerializer(many=True, read_only=True)

    class Meta:
        model = VendorProfile
        fields = [
            'id',
            'user',
            'business_name',
            'location',
            'contact_email',
            'contact_phone',
            'description',
            'fabrics',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'fabrics', 'created_at', 'updated_at']


class StockAdjustmentSerializer(serializers.Serializer):
    quantity_delta = serializers.DecimalField(max_digits=12, decimal_places=2)
    reason = serializers.CharField(allow_blank=True, required=False)
    reference = serializers.CharField(allow_blank=True, required=False)
    event_type = serializers.ChoiceField(
        choices=InventoryEvent.EventType.choices,
        default=InventoryEvent.EventType.ADJUSTMENT,
    )


class PriceUpdateSerializer(serializers.Serializer):
    new_price = serializers.DecimalField(max_digits=10, decimal_places=2)
