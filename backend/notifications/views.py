from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationMarkReadSerializer, NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(user=user)
        if user.is_superuser or user.role == 'admin':
            queryset = Notification.objects.all()
        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        serializer = NotificationMarkReadSerializer(notification, data=request.data or {}, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        output = NotificationSerializer(notification)
        return Response(output.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        updated = self.get_queryset().filter(is_read=False).update(is_read=True, read_at=timezone.now())
        return Response({'updated': updated}, status=status.HTTP_200_OK)
