from rest_framework.permissions import BasePermission


class IsRole(BasePermission):
    allowed_roles = set()

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_superuser or user.role in self.allowed_roles)
        )


class IsAdminRole(IsRole):
    allowed_roles = {'admin'}


class IsVendorRole(IsRole):
    allowed_roles = {'vendor'}


class IsTailorRole(IsRole):
    allowed_roles = {'tailor'}


class IsClientRole(IsRole):
    allowed_roles = {'client'}


class IsVendorOrAdmin(IsRole):
    allowed_roles = {'vendor', 'admin'}


class IsTailorOrAdmin(IsRole):
    allowed_roles = {'tailor', 'admin'}


class IsClientOrAdmin(IsRole):
    allowed_roles = {'client', 'admin'}
