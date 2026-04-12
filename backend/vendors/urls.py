from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorProfileViewSet, FabricItemViewSet

router = DefaultRouter()
router.register('profiles', VendorProfileViewSet)
router.register('fabrics', FabricItemViewSet)

urlpatterns = [path('', include(router.urls))]
