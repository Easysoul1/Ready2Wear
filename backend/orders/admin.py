from django.contrib import admin

from .models import Order, OrderItem, OrderMeasurement, OrderProgressLog


admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(OrderMeasurement)
admin.site.register(OrderProgressLog)
