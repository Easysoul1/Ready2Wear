from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TailorProfileViewSet

router = DefaultRouter()
router.register('profiles', TailorProfileViewSet, basename='tailor-profiles')

urlpatterns = [
    path('', include(router.urls)),
]
