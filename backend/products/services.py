from collections import defaultdict
from decimal import Decimal

from django.db import transaction
from rest_framework.exceptions import ValidationError

from notifications.models import Notification
from notifications.services import dispatch_notification
from vendors.models import InventoryEvent
from vendors.services import adjust_fabric_stock

from .models import Cart, CartItem, MarketplaceOrder, MarketplaceOrderItem, Product


def get_open_cart_for_user(user):
    if user.role not in {'client', 'tailor'} and not user.is_superuser:
        raise ValidationError({'detail': 'Only clients and tailors can use carts.'})
    cart, _ = Cart.objects.get_or_create(owner=user, status=Cart.Status.OPEN)
    return cart


@transaction.atomic
def add_to_cart(*, user, product_id, quantity):
    product = Product.objects.select_related('fabric').filter(pk=product_id, is_published=True).first()
    if not product:
        raise ValidationError({'product_id': 'Product is unavailable.'})

    quantity_decimal = Decimal(quantity)
    if product.fabric.stock_quantity < quantity_decimal:
        raise ValidationError({'quantity': 'Insufficient stock for this product.'})

    cart = get_open_cart_for_user(user)
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={
            'quantity': quantity,
            'unit_price_snapshot': product.fabric.unit_price,
        },
    )
    if not created:
        cart_item.quantity += quantity
        if product.fabric.stock_quantity < Decimal(cart_item.quantity):
            raise ValidationError({'quantity': 'Insufficient stock for this product.'})
        cart_item.unit_price_snapshot = product.fabric.unit_price
        cart_item.save(update_fields=['quantity', 'unit_price_snapshot', 'updated_at'])
    return cart


@transaction.atomic
def remove_from_cart(*, user, product_id):
    cart = get_open_cart_for_user(user)
    deleted, _ = CartItem.objects.filter(cart=cart, product_id=product_id).delete()
    if not deleted:
        raise ValidationError({'product_id': 'Item does not exist in cart.'})
    return cart


@transaction.atomic
def checkout_cart(*, user):
    cart = get_open_cart_for_user(user)
    cart = Cart.objects.select_for_update().prefetch_related('items__product__fabric__vendor__user').get(pk=cart.pk)
    if not cart.items.exists():
        raise ValidationError({'detail': 'Cart is empty.'})

    grouped_items = defaultdict(list)
    for item in cart.items.all():
        grouped_items[item.product.fabric.vendor_id].append(item)

    marketplace_orders = []

    for vendor_id, items in grouped_items.items():
        vendor_profile = items[0].product.fabric.vendor
        marketplace_order = MarketplaceOrder.objects.create(
            buyer=user,
            vendor=vendor_profile,
            status=MarketplaceOrder.Status.PENDING,
            subtotal=Decimal('0'),
        )
        subtotal = Decimal('0')

        for item in items:
            fabric = item.product.fabric
            adjust_fabric_stock(
                fabric_id=fabric.id,
                quantity_delta=Decimal(item.quantity) * Decimal('-1'),
                actor=user,
                reason='Marketplace checkout',
                reference=marketplace_order.order_number,
                event_type=InventoryEvent.EventType.CHECKOUT,
            )
            line_total = Decimal(item.quantity) * item.unit_price_snapshot
            MarketplaceOrderItem.objects.create(
                marketplace_order=marketplace_order,
                product=item.product,
                fabric_name=fabric.name,
                unit=fabric.unit,
                quantity=item.quantity,
                unit_price=item.unit_price_snapshot,
                line_total=line_total,
            )
            subtotal += line_total

        marketplace_order.subtotal = subtotal
        marketplace_order.save(update_fields=['subtotal', 'updated_at'])
        marketplace_orders.append(marketplace_order)

        dispatch_notification(
            user=vendor_profile.user,
            notif_type=Notification.Type.MARKETPLACE,
            title=f'New marketplace order {marketplace_order.order_number}',
            message=f'{user.email} placed an order for your fabrics.',
            payload={'marketplace_order_id': marketplace_order.id},
        )

    dispatch_notification(
        user=user,
        notif_type=Notification.Type.MARKETPLACE,
        title='Marketplace checkout complete',
        message='Your marketplace checkout was successful.',
        payload={'orders': [order.order_number for order in marketplace_orders]},
    )

    cart.status = Cart.Status.CHECKED_OUT
    cart.save(update_fields=['status', 'updated_at'])
    return marketplace_orders
