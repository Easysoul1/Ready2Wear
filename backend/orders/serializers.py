from rest_framework import serializers

from accounts.models import User

from .models import Order, OrderItem, OrderMeasurement, OrderProgressLog


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id',
            'fabric',
            'description',
            'quantity',
            'unit_price',
            'line_total',
        ]
        read_only_fields = ['id', 'line_total']


class OrderMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderMeasurement
        fields = ['measurements', 'notes', 'captured_by', 'captured_at']
        read_only_fields = ['captured_by', 'captured_at']


class OrderProgressLogSerializer(serializers.ModelSerializer):
    changed_by = UserMiniSerializer(read_only=True)

    class Meta:
        model = OrderProgressLog
        fields = ['id', 'stage', 'message', 'changed_by', 'created_at']
        read_only_fields = ['id', 'changed_by', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    client_detail = UserMiniSerializer(source='client', read_only=True)
    tailor_detail = UserMiniSerializer(source='tailor', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    measurement = OrderMeasurementSerializer(read_only=True)
    progress_logs = OrderProgressLogSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'title',
            'client',
            'client_detail',
            'tailor',
            'tailor_detail',
            'selected_fabric',
            'style_notes',
            'total_estimate',
            'deadline',
            'expected_delivery',
            'current_stage',
            'status',
            'created_by',
            'delivered_at',
            'items',
            'measurement',
            'progress_logs',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'order_number',
            'current_stage',
            'status',
            'created_by',
            'delivered_at',
            'created_at',
            'updated_at',
        ]


class OrderCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    client = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role=User.Role.CLIENT))
    tailor = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role=User.Role.TAILOR))
    selected_fabric = serializers.IntegerField(required=False, allow_null=True)
    style_notes = serializers.CharField(required=False, allow_blank=True)
    total_estimate = serializers.DecimalField(required=False, allow_null=True, max_digits=12, decimal_places=2)
    deadline = serializers.DateField()
    expected_delivery = serializers.DateField(required=False, allow_null=True)
    items = OrderItemSerializer(many=True, required=False)
    measurement = OrderMeasurementSerializer(required=False)


class OrderStageUpdateSerializer(serializers.Serializer):
    stage = serializers.ChoiceField(choices=Order.Stage.choices)
    message = serializers.CharField(required=False, allow_blank=True)


class OrderProgressNoteSerializer(serializers.Serializer):
    message = serializers.CharField(required=False, allow_blank=True)


class OrderMeasurementUpdateSerializer(serializers.Serializer):
    measurements = serializers.JSONField()
    notes = serializers.CharField(required=False, allow_blank=True)
