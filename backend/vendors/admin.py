from django.contrib import admin

from .models import FabricItem, InventoryEvent, PriceHistory, VendorProfile


admin.site.register(VendorProfile)
admin.site.register(FabricItem)
admin.site.register(PriceHistory)
admin.site.register(InventoryEvent)
