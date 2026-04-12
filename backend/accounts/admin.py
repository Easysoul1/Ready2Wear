from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (('Role & Contact', {'fields': ('role', 'phone')}),)
    list_display = ['email', 'username', 'role', 'is_active']
