from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from .models import TailorProfile
from .serializers import TailorProfileSerializer


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
