from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CartViewSet, MarketplaceOrderViewSet, ProductViewSet
from tailors.views import TailorReadyMadeProductViewSet as TRMViewSet
from vendors.views import VendorMarketplaceViewSet

router = DefaultRouter()
router.register('products', ProductViewSet, basename='products')
router.register('cart', CartViewSet, basename='cart')
router.register('marketplace-orders', MarketplaceOrderViewSet, basename='marketplace-orders')
router.register('ready-made', TRMViewSet, basename='public-ready-made')
router.register('vendor-marketplace', VendorMarketplaceViewSet, basename='public-vendor-marketplace')

urlpatterns = [
    path('', include(router.urls)),
]
