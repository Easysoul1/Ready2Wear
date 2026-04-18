from django.db import models
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import FabricItem, VendorProfile
from .serializers import (
    FabricItemSerializer,
    PriceUpdateSerializer,
    StockAdjustmentSerializer,
    VendorProfileSerializer,
)
from .services import adjust_fabric_stock, update_fabric_price


class VendorProfileViewSet(viewsets.ModelViewSet):
    queryset = VendorProfile.objects.select_related('user').prefetch_related('fabrics').all()
    serializer_class = VendorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'admin':
            return self.queryset
        if user.role == 'vendor':
            return self.queryset.filter(user=user)
        return self.queryset.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'vendor':
            raise PermissionDenied('Only vendors can create a vendor profile.')
        serializer.save(user=user)


class FabricItemViewSet(viewsets.ModelViewSet):
    queryset = FabricItem.objects.select_related('vendor', 'vendor__user').prefetch_related('price_history', 'inventory_events')
    serializer_class = FabricItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        if user.is_superuser or user.role == 'admin':
            return queryset
        if user.role == 'vendor':
            return queryset.filter(vendor__user=user)
        return queryset.filter(is_public=True, is_active=True)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'vendor':
            raise PermissionDenied('Only vendors can manage fabric inventory.')
        vendor_profile = VendorProfile.objects.filter(user=user).first()
        if not vendor_profile:
            raise PermissionDenied('Create your vendor profile before adding fabrics.')
        serializer.save(vendor=vendor_profile)

    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock(self, request):
        user = request.user
        if user.role not in {'vendor', 'admin'} and not user.is_superuser:
            raise PermissionDenied('Only vendors and admins can view low stock items.')
        queryset = self.get_queryset().filter(stock_quantity__lte=models.F('low_stock_threshold'))
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='adjust-stock')
    def adjust_stock(self, request, pk=None):
        fabric = self.get_object()
        user = request.user
        if user.role not in {'vendor', 'admin'} and not user.is_superuser:
            raise PermissionDenied('Only vendors and admins can adjust stock.')
        if user.role == 'vendor' and fabric.vendor.user_id != user.id:
            raise PermissionDenied('You can only adjust your own inventory.')

        serializer = StockAdjustmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_fabric = adjust_fabric_stock(
            fabric_id=fabric.id,
            actor=user,
            **serializer.validated_data,
        )
        return Response(self.get_serializer(updated_fabric).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='update-price')
    def update_price(self, request, pk=None):
        fabric = self.get_object()
        user = request.user
        if user.role not in {'vendor', 'admin'} and not user.is_superuser:
            raise PermissionDenied('Only vendors and admins can update prices.')
        if user.role == 'vendor' and fabric.vendor.user_id != user.id:
            raise PermissionDenied('You can only update prices for your own inventory.')

        serializer = PriceUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_fabric = update_fabric_price(
            fabric_id=fabric.id,
            new_price=serializer.validated_data['new_price'],
            actor=user,
        )
        return Response(self.get_serializer(updated_fabric).data, status=status.HTTP_200_OK)
