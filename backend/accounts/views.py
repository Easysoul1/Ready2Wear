import logging
from datetime import datetime

from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView

from .permissions import IsAdminRole
from .serializers import (
    AdminUserSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserSerializer,
)
from .models import User
from .password_utils import generate_reset_token, hash_token, get_token_expiry, is_token_valid, generate_password_reset_url, cleanup_expired_tokens
from .emails import send_password_reset_email, send_password_changed_notification

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    http_method_names = ['get', 'patch', 'head', 'options']


class DirectoryView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.filter(is_active=True)
        role = self.request.query_params.get('role')
        role_values = {choice[0] for choice in User.Role.choices}
        if role in role_values:
            queryset = queryset.filter(role=role)
        if self.request.user.role != User.Role.ADMIN and not self.request.user.is_superuser:
            queryset = queryset.exclude(role=User.Role.ADMIN)
        return queryset.order_by('email')


class ForgotPasswordView(generics.GenericAPIView):
    serializer_class = ForgotPasswordSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email'].strip().lower()
        user = User.objects.filter(email__iexact=email).first()
        
        if user:
            cleanup_expired_tokens(user)
            
            raw_token = generate_reset_token()
            token_hash = hash_token(raw_token)
            token_expiry = get_token_expiry()
            
            user.reset_token_hash = token_hash
            user.reset_token_expiry = token_expiry
            user.save(update_fields=['reset_token_hash', 'reset_token_expiry'])
            
            reset_url = generate_password_reset_url(raw_token, request)
            send_password_reset_email(user, reset_url)
            
            logger.info(f'Password reset requested for user {user.email}')
        else:
            logger.warning(f'Password reset requested for non-existent email {email}')
        
        return Response(
            {'success': True, 'message': 'If an account with that email exists, we have sent a password reset link.'},
            status=status.HTTP_200_OK
        )


class ResetPasswordView(generics.GenericAPIView):
    serializer_class = ResetPasswordSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        raw_token = serializer.validated_data['token']
        new_password = serializer.validated_data['password']
        
        logger.info(f'=== PASSWORD RESET DEBUG ===')
        logger.info(f'Token received: {raw_token}')
        logger.info(f'Token length: {len(raw_token)}')
        
        token_hash = hash_token(raw_token)
        logger.info(f'Hash computed: {token_hash}')
        
        user = User.objects.filter(
            reset_token_hash=token_hash,
            is_active=True
        ).first()
        
        if not user:
            logger.warning(f'No user found with token hash: {token_hash}')
            return Response(
                {'success': False, 'errors': {'token': 'Invalid or expired reset token.'}},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f'User found: {user.email}')
        logger.info(f'Token expiry: {user.reset_token_expiry}')
        
        if not is_token_valid(raw_token, user.reset_token_hash, user.reset_token_expiry):
            logger.warning(f'Expired token - current: {timezone.now()}, expiry: {user.reset_token_expiry}')
            return Response(
                {'success': False, 'errors': {'token': 'Invalid or expired reset token.'}},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.reset_token_hash = ''
        user.reset_token_expiry = None
        user.save(update_fields=['password', 'reset_token_hash', 'reset_token_expiry'])
        
        logger.info(f'Password successfully reset for user {user.email}')
        
        send_password_changed_notification(user)
        
        return Response(
            {'success': True, 'message': 'Password has been reset successfully. You can now log in with your new password.'},
            status=status.HTTP_200_OK
        )
