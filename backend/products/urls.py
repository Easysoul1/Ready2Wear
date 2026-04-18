from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CartViewSet, MarketplaceOrderViewSet, ProductViewSet

router = DefaultRouter()
router.register('products', ProductViewSet, basename='products')
router.register('cart', CartViewSet, basename='cart')
router.register('marketplace-orders', MarketplaceOrderViewSet, basename='marketplace-orders')

urlpatterns = [
    path('', include(router.urls)),
]
