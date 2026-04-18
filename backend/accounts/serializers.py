from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    username = serializers.CharField(required=False, allow_blank=True)
    full_name = serializers.CharField(max_length=255)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'username',
            'first_name',
            'last_name',
            'role',
            'phone',
            'password',
            'password2',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        if attrs.get('role') == User.Role.ADMIN:
            raise serializers.ValidationError({'role': 'Admin accounts are created by administrators only.'})
        attrs['full_name'] = attrs['full_name'].strip()
        if not attrs['full_name']:
            raise serializers.ValidationError({'full_name': 'Full name is required.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        full_name = validated_data.get('full_name', '').strip()
        name_parts = full_name.split(maxsplit=1)
        validated_data['first_name'] = name_parts[0] if name_parts else ''
        validated_data['last_name'] = name_parts[1] if len(name_parts) > 1 else ''
        return User.objects.create_user(password=password, **validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'username',
            'first_name',
            'last_name',
            'role',
            'phone',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'role', 'created_at', 'updated_at']


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'username',
            'first_name',
            'last_name',
            'role',
            'phone',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LoginSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        return token
