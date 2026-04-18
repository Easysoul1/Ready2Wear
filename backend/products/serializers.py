from decimal import Decimal

from rest_framework import serializers

from .models import Cart, CartItem, MarketplaceOrder, MarketplaceOrderItem, Product


class ProductSerializer(serializers.ModelSerializer):
    vendor_id = serializers.IntegerField(source='fabric.vendor.id', read_only=True)
    vendor_name = serializers.CharField(source='fabric.vendor.business_name', read_only=True)
    stock_quantity = serializers.DecimalField(source='fabric.stock_quantity', max_digits=12, decimal_places=2, read_only=True)
    unit_price = serializers.DecimalField(source='fabric.unit_price', max_digits=10, decimal_places=2, read_only=True)
    fabric_unit = serializers.CharField(source='fabric.unit', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'fabric',
            'vendor_id',
            'vendor_name',
            'title',
            'description',
            'images',
            'is_published',
            'stock_quantity',
            'unit_price',
            'fabric_unit',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id',
            'product',
            'product_detail',
            'quantity',
            'unit_price_snapshot',
            'line_total',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'unit_price_snapshot', 'line_total', 'created_at', 'updated_at']

    def get_line_total(self, obj):
        return Decimal(obj.quantity) * obj.unit_price_snapshot


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'owner', 'status', 'items', 'total', 'created_at', 'updated_at']
        read_only_fields = ['id', 'owner', 'status', 'items', 'total', 'created_at', 'updated_at']

    def get_total(self, obj):
        total = Decimal('0')
        for item in obj.items.all():
            total += Decimal(item.quantity) * item.unit_price_snapshot
        return total


class AddCartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class RemoveCartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()


class MarketplaceOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketplaceOrderItem
        fields = [
            'id',
            'product',
            'fabric_name',
            'unit',
            'quantity',
            'unit_price',
            'line_total',
        ]


class MarketplaceOrderSerializer(serializers.ModelSerializer):
    items = MarketplaceOrderItemSerializer(many=True, read_only=True)
    vendor_name = serializers.CharField(source='vendor.business_name', read_only=True)

    class Meta:
        model = MarketplaceOrder
        fields = [
            'id',
            'order_number',
            'buyer',
            'vendor',
            'vendor_name',
            'status',
            'subtotal',
            'items',
            'created_at',
            'updated_at',
        ]
