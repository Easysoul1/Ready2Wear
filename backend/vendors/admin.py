from django.contrib import admin
from .models import VendorProfile, FabricItem, PriceHistory
admin.site.register(VendorProfile)
admin.site.register(FabricItem)
admin.site.register(PriceHistory)
