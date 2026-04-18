from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from .models import ClientProfile
from .serializers import ClientProfileSerializer


class ClientProfileViewSet(viewsets.ModelViewSet):
    queryset = ClientProfile.objects.select_related('user').all()
    serializer_class = ClientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'admin':
            return self.queryset
        if user.role == 'client':
            return self.queryset.filter(user=user)
        return self.queryset.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'client' and not user.is_superuser:
            raise PermissionDenied('Only clients can create client profiles.')
        serializer.save(user=user)
