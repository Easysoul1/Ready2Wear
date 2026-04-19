from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

from notifications.models import Notification
from orders.models import Order


class Command(BaseCommand):
    help = 'Send automated deadline reminders via mock Twilio/Firebase for approaching orders'

    def handle(self, *args, **kwargs):
        self.stdout.write("Scanning for upcoming deadlines...")
        
        horizon = timezone.now().date() + timedelta(days=3)
        # Find orders ending in less than or equal to 3 days that are not delivered/cancelled
        orders = Order.objects.filter(
            deadline__lte=horizon,
        ).exclude(status__in=['completed', 'cancelled', 'delivered'])

        reminder_count = 0
        for order in orders:
            # We don't want to spam if we already sent one today
            already_notified = Notification.objects.filter(
                user=order.tailor,
                notif_type=Notification.Type.DEADLINE,
                created_at__date=timezone.now().date(),
                payload__order_id=order.id
            ).exists()
            
            if not already_notified:
                # 1. Save an In-App notification
                Notification.objects.create(
                    user=order.tailor,
                    title="Deadline Approaching",
                    message=f"Urgent: Order #{order.order_number} ({order.title}) is due on {order.deadline}. Please update its stage.",
                    notif_type=Notification.Type.DEADLINE,
                    channel=Notification.Channel.IN_APP,
                    payload={"order_id": order.id}
                )
                
                # 2. Mock Firebase/Twilio Push
                # In production, you would import Twilio REST client here
                # client.messages.create(body="...", from_='...', to=order.tailor.phone)
                self.stdout.write(
                    self.style.WARNING(
                        f"[MOCK TWILIO/FIREBASE] 🚀 Push Notification/SMS sent to Tailor {order.tailor.email} "
                        f"for order {order.order_number} | Due: {order.deadline}"
                    )
                )
                reminder_count += 1
                
        self.stdout.write(self.style.SUCCESS(f'Successfully processed. Sent {reminder_count} reminders.'))
