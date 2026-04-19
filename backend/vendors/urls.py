from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorMarketplaceViewSet, VendorProfileViewSet, FabricItemViewSet

router = DefaultRouter()
router.register('profiles', VendorProfileViewSet)
router.register('fabrics', FabricItemViewSet)
router.register('marketplace', VendorMarketplaceViewSet, basename='marketplace')

urlpatterns = [path('', include(router.urls))]
