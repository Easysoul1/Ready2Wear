from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/vendors/', include('vendors.urls')),
    path('api/tailors/', include('tailors.urls')),
    path('api/clients/', include('clients.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/products/', include('products.urls')),
    path('api/notifications/', include('notifications.urls')),
]
