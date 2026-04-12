from django.contrib import admin
from .models import Order, OrderMilestone, FabricRequest
admin.site.register(Order)
admin.site.register(OrderMilestone)
admin.site.register(FabricRequest)
