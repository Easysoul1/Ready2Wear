from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import Order
from .serializers import (
    OrderCreateSerializer,
    OrderMeasurementSerializer,
    OrderMeasurementUpdateSerializer,
    OrderProgressLogSerializer,
    OrderProgressNoteSerializer,
    OrderSerializer,
    OrderStageUpdateSerializer,
)
from .services import add_progress_note, create_order, update_order_stage, upsert_measurements


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related(
        'client',
        'tailor',
        'selected_fabric',
        'created_by',
    ).prefetch_related('items', 'progress_logs', 'measurement')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        if user.is_superuser or user.role == 'admin':
            return queryset
        if user.role == 'tailor':
            return queryset.filter(tailor=user)
        if user.role == 'client':
            return queryset.filter(client=user)
        if user.role == 'vendor':
            return queryset.filter(
                Q(selected_fabric__vendor__user=user) | Q(items__fabric__vendor__user=user)
            ).distinct()
        return queryset.none()

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if user.role == 'client' and serializer.validated_data['client'].id != user.id:
            raise PermissionDenied('Clients can only create orders for themselves.')
        if user.role not in {'tailor', 'client', 'admin'} and not user.is_superuser:
            raise PermissionDenied('You do not have permission to create orders.')

        order = create_order(payload=serializer.validated_data, actor=user)
        output = OrderSerializer(order, context=self.get_serializer_context())
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='update-stage')
    def update_stage(self, request, pk=None):
        order = self.get_object()
        user = request.user
        if user.role not in {'tailor', 'admin'} and not user.is_superuser:
            raise PermissionDenied('Only tailors and admins can update workflow stages.')
        if user.role == 'tailor' and order.tailor_id != user.id:
            raise PermissionDenied('You can only update your own assigned orders.')

        serializer = OrderStageUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_order = update_order_stage(order_id=order.id, actor=user, **serializer.validated_data)
        return Response(OrderSerializer(updated_order).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='progress-log')
    def add_progress_log(self, request, pk=None):
        order = self.get_object()
        serializer = OrderProgressNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        log = add_progress_note(order=order, actor=request.user, **serializer.validated_data)
        return Response(OrderProgressLogSerializer(log).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['put', 'patch'], url_path='measurements')
    def set_measurements(self, request, pk=None):
        order = self.get_object()
        user = request.user
        if user.role not in {'tailor', 'admin'} and not user.is_superuser:
            raise PermissionDenied('Only tailors and admins can set measurements.')
        if user.role == 'tailor' and order.tailor_id != user.id:
            raise PermissionDenied('You can only set measurements on your own assigned orders.')
        serializer = OrderMeasurementUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        measurement = upsert_measurements(order=order, actor=user, **serializer.validated_data)
        return Response(OrderMeasurementSerializer(measurement).data, status=status.HTTP_200_OK)
