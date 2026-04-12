from rest_framework import viewsets, permissions
from .models import VendorProfile, FabricItem
from .serializers import VendorProfileSerializer, FabricItemSerializer


class VendorProfileViewSet(viewsets.ModelViewSet):
    queryset = VendorProfile.objects.all()
    serializer_class = VendorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


class FabricItemViewSet(viewsets.ModelViewSet):
    queryset = FabricItem.objects.all()
    serializer_class = FabricItemSerializer
    permission_classes = [permissions.IsAuthenticated]
