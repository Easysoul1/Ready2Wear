from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from notifications.services import notify_order_update
from vendors.models import FabricItem

from .models import Order, OrderItem, OrderMeasurement, OrderProgressLog

STAGE_ORDER = {
    Order.Stage.PENDING: 0,
    Order.Stage.CUTTING: 1,
    Order.Stage.SEWING: 2,
    Order.Stage.FINISHING: 3,
    Order.Stage.READY: 4,
}


def _validate_stage_transition(current_stage, next_stage):
    if STAGE_ORDER[next_stage] < STAGE_ORDER[current_stage]:
        raise ValidationError({'stage': 'Stage regression is not allowed.'})


@transaction.atomic
def create_order(*, payload, actor):
    fabric = None
    selected_fabric = payload.get('selected_fabric')
    if selected_fabric:
        fabric = FabricItem.objects.filter(pk=selected_fabric, is_active=True).first()
        if not fabric:
            raise ValidationError({'selected_fabric': 'Selected fabric does not exist or is inactive.'})

    order = Order.objects.create(
        title=payload['title'],
        client=payload['client'],
        tailor=payload['tailor'],
        selected_fabric=fabric,
        style_notes=payload.get('style_notes', ''),
        total_estimate=payload.get('total_estimate'),
        deadline=payload['deadline'],
        expected_delivery=payload.get('expected_delivery'),
        created_by=actor,
    )

    items_payload = payload.get('items') or []
    for item_data in items_payload:
        OrderItem.objects.create(order=order, **item_data)

    measurement_payload = payload.get('measurement')
    if measurement_payload:
        OrderMeasurement.objects.create(
            order=order,
            measurements=measurement_payload.get('measurements', {}),
            notes=measurement_payload.get('notes', ''),
            captured_by=actor,
        )

    OrderProgressLog.objects.create(
        order=order,
        stage=Order.Stage.PENDING,
        message='Order created.',
        changed_by=actor,
    )
    notify_order_update(order, f'Order {order.order_number} has been created.')
    return order


@transaction.atomic
def update_order_stage(*, order_id, stage, actor, message=''):
    order = Order.objects.select_for_update().get(pk=order_id)
    _validate_stage_transition(order.current_stage, stage)

    order.current_stage = stage
    if stage == Order.Stage.READY:
        order.status = Order.Status.COMPLETED
        order.delivered_at = timezone.now()
    order.save(update_fields=['current_stage', 'status', 'delivered_at', 'updated_at'])

    OrderProgressLog.objects.create(
        order=order,
        stage=stage,
        message=message or f'Stage updated to {stage}.',
        changed_by=actor,
    )
    notify_order_update(order, f'Order {order.order_number} moved to {stage}.')
    return order


def add_progress_note(*, order, actor, message=''):
    return OrderProgressLog.objects.create(
        order=order,
        stage=order.current_stage,
        message=message,
        changed_by=actor,
    )


@transaction.atomic
def upsert_measurements(*, order, actor, measurements, notes=''):
    measurement, _ = OrderMeasurement.objects.get_or_create(order=order)
    measurement.measurements = measurements
    measurement.notes = notes
    measurement.captured_by = actor
    measurement.save(update_fields=['measurements', 'notes', 'captured_by', 'captured_at'])
    return measurement
