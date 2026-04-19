from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TailorProfileViewSet, TailorReadyMadeProductViewSet

router = DefaultRouter()
router.register('profiles', TailorProfileViewSet, basename='tailor-profiles')
router.register('ready-made', TailorReadyMadeProductViewSet, basename='ready-made')

urlpatterns = [
    path('', include(router.urls)),
]
