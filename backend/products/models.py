from django.db import models
from django.db.models import Q
from uuid import uuid4

from accounts.models import User
from vendors.models import FabricItem, VendorProfile


class Product(models.Model):
    fabric = models.OneToOneField(FabricItem, on_delete=models.CASCADE, related_name='product_listing')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    images = models.JSONField(default=list, blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_published']),
            models.Index(fields=['title']),
        ]

    def __str__(self):
        return self.title


class Cart(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        CHECKED_OUT = 'checked_out', 'Checked Out'

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='carts')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['owner'],
                condition=Q(status='open'),
                name='one_open_cart_per_user',
            )
        ]

    def __str__(self):
        return f'{self.owner.email} ({self.status})'


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveIntegerField()
    unit_price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        constraints = [
            models.UniqueConstraint(fields=['cart', 'product'], name='unique_cart_product'),
            models.CheckConstraint(condition=Q(quantity__gt=0), name='cart_item_quantity_positive'),
            models.CheckConstraint(condition=Q(unit_price_snapshot__gte=0), name='cart_item_price_non_negative'),
        ]

    def __str__(self):
        return f'{self.cart.owner.email} -> {self.product.title}'


class MarketplaceOrder(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        FULFILLED = 'fulfilled', 'Fulfilled'
        CANCELLED = 'cancelled', 'Cancelled'

    order_number = models.CharField(max_length=24, unique=True, editable=False)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='marketplace_orders')
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='marketplace_orders')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['buyer', 'status']),
            models.Index(fields=['vendor', 'status']),
        ]

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f'MKT-{uuid4().hex[:12].upper()}'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.order_number


class MarketplaceOrderItem(models.Model):
    marketplace_order = models.ForeignKey(
        MarketplaceOrder,
        on_delete=models.CASCADE,
        related_name='items',
    )
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='marketplace_items')
    fabric_name = models.CharField(max_length=200)
    unit = models.CharField(max_length=20)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=Q(quantity__gt=0), name='marketplace_item_quantity_positive'),
            models.CheckConstraint(condition=Q(unit_price__gte=0), name='marketplace_item_price_non_negative'),
            models.CheckConstraint(condition=Q(line_total__gte=0), name='marketplace_item_line_total_non_negative'),
        ]

    def __str__(self):
        return f'{self.marketplace_order.order_number} item #{self.pk}'
