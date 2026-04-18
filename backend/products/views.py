from django.core.cache import cache
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from vendors.models import VendorProfile

from .models import MarketplaceOrder, Product
from .serializers import (
    AddCartItemSerializer,
    CartSerializer,
    MarketplaceOrderSerializer,
    ProductSerializer,
    RemoveCartItemSerializer,
)
from .services import add_to_cart, checkout_cart, get_open_cart_for_user, remove_from_cart


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('fabric', 'fabric__vendor', 'fabric__vendor__user').all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        if user.is_superuser or user.role == 'admin':
            return queryset
        if user.role == 'vendor':
            return queryset.filter(fabric__vendor__user=user)
        return queryset.filter(is_published=True, fabric__is_active=True, fabric__is_public=True)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'vendor':
            raise PermissionDenied('Only vendors can create products.')
        vendor_profile = VendorProfile.objects.filter(user=user).first()
        if not vendor_profile:
            raise PermissionDenied('Create your vendor profile before publishing products.')
        fabric = serializer.validated_data['fabric']
        if fabric.vendor_id != vendor_profile.id:
            raise PermissionDenied('You can only publish products from your own inventory.')
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        if user.role == 'vendor' and serializer.instance.fabric.vendor.user_id != user.id:
            raise PermissionDenied('You can only update your own products.')
        serializer.save()

    def list(self, request, *args, **kwargs):
        if request.user.role in {'client', 'tailor'}:
            cache_key = f'products:list:{request.get_full_path()}'
            cached = cache.get(cache_key)
            if cached is not None:
                return Response(cached)
            response = super().list(request, *args, **kwargs)
            cache.set(cache_key, response.data, timeout=60)
            return response
        return super().list(request, *args, **kwargs)


class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        cart = get_open_cart_for_user(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='items')
    def add_item(self, request):
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = add_to_cart(user=request.user, **serializer.validated_data)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['delete'], url_path='items')
    def remove_item(self, request):
        serializer = RemoveCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = remove_from_cart(user=request.user, **serializer.validated_data)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='checkout')
    def checkout(self, request):
        orders = checkout_cart(user=request.user)
        return Response(MarketplaceOrderSerializer(orders, many=True).data, status=status.HTTP_201_CREATED)


class MarketplaceOrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MarketplaceOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = MarketplaceOrder.objects.select_related('buyer', 'vendor', 'vendor__user').prefetch_related('items')

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        if user.is_superuser or user.role == 'admin':
            return queryset
        if user.role == 'vendor':
            return queryset.filter(vendor__user=user)
        return queryset.filter(buyer=user)
