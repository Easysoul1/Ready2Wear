from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ClientProfileViewSet

router = DefaultRouter()
router.register('profiles', ClientProfileViewSet, basename='client-profiles')

urlpatterns = [
    path('', include(router.urls)),
]
