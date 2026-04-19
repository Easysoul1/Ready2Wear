from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import CloudinaryImage, TailorProfile, TailorReadyMadeProduct
from .serializers import (
    CloudinaryImageSerializer,
    TailorProfileSerializer,
    TailorReadyMadeProductSerializer,
)


class TailorProfileViewSet(viewsets.ModelViewSet):
    queryset = TailorProfile.objects.select_related('user').all()
    serializer_class = TailorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'admin':
            return self.queryset
        if user.role == 'tailor':
            return self.queryset.filter(user=user)
        return self.queryset.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'tailor' and not user.is_superuser:
            raise PermissionDenied('Only tailors can create tailor profiles.')
        serializer.save(user=user)


class TailorReadyMadeProductViewSet(viewsets.ModelViewSet):
    queryset = TailorReadyMadeProduct.objects.select_related('tailor', 'tailor__user').prefetch_related('images')
    serializer_class = TailorReadyMadeProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'tailor':
            return self.queryset.filter(tailor__user=user)
        return self.queryset.filter(is_available=True)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'tailor':
            raise PermissionDenied('Only tailors can list ready-made products.')
        tailor_profile = TailorProfile.objects.filter(user=user).first()
        if not tailor_profile:
            raise PermissionDenied('Create your tailor profile first.')
        
        images_data = self.request.data.get('images', [])
        images = []
        for img_data in images_data:
            img, _ = CloudinaryImage.objects.get_or_create(
                public_id=img_data.get('public_id'),
                defaults={
                    'url': img_data.get('url'),
                    'secure_url': img_data.get('secure_url'),
                }
            )
            images.append(img)
        
        item = serializer.save(tailor=tailor_profile)
        if images:
            item.images.set(images)


class PublicMarketplaceViewSet(viewsets.ReadOnlyModelViewSet):
    """Public marketplace listing - anyone can view."""
    from .models import TailorReadyMadeProduct as TRM
    from .serializers import TailorReadyMadeProductSerializer
    
    def get_queryset(self):
        return TRM.objects.filter(is_available=True).select_related('tailor', 'tailor__user').prefetch_related('images')
    
    serializer_class = TailorReadyMadeProductSerializer
    permission_classes = [permissions.AllowAny]
