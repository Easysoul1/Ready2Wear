from smtplib import SMTPException

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import Notification


def dispatch_notification(
    *,
    user,
    notif_type,
    title,
    message,
    payload=None,
    channels=None,
):
    payload = payload or {}
    channels = channels or [Notification.Channel.IN_APP, Notification.Channel.EMAIL]
    created_notifications = []

    for channel in channels:
        notification = Notification.objects.create(
            user=user,
            notif_type=notif_type,
            title=title,
            message=message,
            payload=payload,
            channel=channel,
            delivery_status=Notification.DeliveryStatus.PENDING,
        )
        if channel == Notification.Channel.IN_APP:
            notification.delivery_status = Notification.DeliveryStatus.SENT
            notification.sent_at = timezone.now()
            notification.save(update_fields=['delivery_status', 'sent_at'])
        elif channel == Notification.Channel.EMAIL:
            try:
                send_mail(
                    subject=title,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except SMTPException:
                notification.delivery_status = Notification.DeliveryStatus.FAILED
                notification.save(update_fields=['delivery_status'])
                raise
            notification.delivery_status = Notification.DeliveryStatus.SENT
            notification.sent_at = timezone.now()
            notification.save(update_fields=['delivery_status', 'sent_at'])
        created_notifications.append(notification)

    return created_notifications


def notify_order_update(order, message):
    payload = {
        'order_id': order.id,
        'order_number': order.order_number,
        'stage': order.current_stage,
    }
    dispatch_notification(
        user=order.client,
        notif_type=Notification.Type.ORDER_UPDATE,
        title=f'Order {order.order_number} update',
        message=message,
        payload=payload,
    )
    if order.tailor_id != order.client_id:
        dispatch_notification(
            user=order.tailor,
            notif_type=Notification.Type.ORDER_UPDATE,
            title=f'Order {order.order_number} update',
            message=message,
            payload=payload,
        )


def notify_low_stock(fabric_item):
    payload = {
        'fabric_id': fabric_item.id,
        'fabric_name': fabric_item.name,
        'stock_quantity': str(fabric_item.stock_quantity),
    }
    dispatch_notification(
        user=fabric_item.vendor.user,
        notif_type=Notification.Type.LOW_STOCK,
        title=f'Low stock alert for {fabric_item.name}',
        message=f'Stock is now {fabric_item.stock_quantity} {fabric_item.unit}.',
        payload=payload,
    )
