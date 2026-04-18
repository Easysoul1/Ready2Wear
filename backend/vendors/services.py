from decimal import Decimal

from django.db import transaction
from rest_framework.exceptions import ValidationError

from notifications.services import notify_low_stock

from .models import FabricItem, InventoryEvent, PriceHistory


@transaction.atomic
def adjust_fabric_stock(
    *,
    fabric_id,
    quantity_delta,
    actor,
    reason='',
    reference='',
    event_type=InventoryEvent.EventType.ADJUSTMENT,
):
    fabric = FabricItem.objects.select_for_update().select_related('vendor__user').get(pk=fabric_id)
    updated_quantity = fabric.stock_quantity + Decimal(quantity_delta)
    if updated_quantity < 0:
        raise ValidationError({'quantity_delta': 'Stock cannot go negative.'})

    fabric.stock_quantity = updated_quantity
    fabric.save(update_fields=['stock_quantity', 'updated_at'])
    InventoryEvent.objects.create(
        fabric=fabric,
        event_type=event_type,
        quantity_delta=Decimal(quantity_delta),
        reason=reason,
        reference=reference,
        created_by=actor,
    )

    if fabric.is_low_stock:
        notify_low_stock(fabric)

    return fabric


@transaction.atomic
def update_fabric_price(*, fabric_id, new_price, actor):
    fabric = FabricItem.objects.select_for_update().get(pk=fabric_id)
    new_price = Decimal(new_price)
    if new_price < 0:
        raise ValidationError({'new_price': 'Price cannot be negative.'})
    if new_price != fabric.unit_price:
        PriceHistory.objects.create(
            fabric=fabric,
            old_price=fabric.unit_price,
            new_price=new_price,
            changed_by=actor,
        )
        fabric.unit_price = new_price
        fabric.save(update_fields=['unit_price', 'updated_at'])
    return fabric
