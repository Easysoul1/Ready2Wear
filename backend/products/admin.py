from django.contrib import admin

from .models import Cart, CartItem, MarketplaceOrder, MarketplaceOrderItem, Product


admin.site.register(Product)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(MarketplaceOrder)
admin.site.register(MarketplaceOrderItem)
