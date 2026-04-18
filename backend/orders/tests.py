from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase

from accounts.models import User

from .models import Order, OrderProgressLog
from .services import create_order, update_order_stage


class OrderWorkflowServiceTests(TestCase):
    def setUp(self):
        self.client_user = User.objects.create_user(
            email='client@example.com',
            username='client_a',
            role=User.Role.CLIENT,
            password='ClientPass123!',
        )
        self.tailor_user = User.objects.create_user(
            email='tailor@example.com',
            username='tailor_a',
            role=User.Role.TAILOR,
            password='TailorPass123!',
        )

    def test_create_order_and_progress_log(self):
        order = create_order(
            payload={
                'title': 'Aso ebi gown',
                'client': self.client_user,
                'tailor': self.tailor_user,
                'deadline': timezone.now().date() + timedelta(days=7),
                'style_notes': 'Use fitted style',
                'items': [],
            },
            actor=self.tailor_user,
        )
        self.assertEqual(order.current_stage, Order.Stage.PENDING)
        self.assertEqual(OrderProgressLog.objects.filter(order=order).count(), 1)

    def test_stage_regression_is_blocked(self):
        order = create_order(
            payload={
                'title': 'Office shirt',
                'client': self.client_user,
                'tailor': self.tailor_user,
                'deadline': timezone.now().date() + timedelta(days=10),
                'items': [],
            },
            actor=self.tailor_user,
        )
        update_order_stage(
            order_id=order.id,
            stage=Order.Stage.SEWING,
            actor=self.tailor_user,
            message='Jumped directly to sewing',
        )
        with self.assertRaises(ValidationError):
            update_order_stage(
                order_id=order.id,
                stage=Order.Stage.CUTTING,
                actor=self.tailor_user,
                message='Invalid stage rollback',
            )


class OrderApiPermissionTests(APITestCase):
    def setUp(self):
        self.client_user = User.objects.create_user(
            email='client-api@example.com',
            username='client_api',
            role=User.Role.CLIENT,
            password='ClientPass123!',
        )
        self.other_client = User.objects.create_user(
            email='client-other@example.com',
            username='client_other',
            role=User.Role.CLIENT,
            password='ClientPass123!',
        )
        self.tailor_user = User.objects.create_user(
            email='tailor-api@example.com',
            username='tailor_api',
            role=User.Role.TAILOR,
            password='TailorPass123!',
        )
        self.client.force_authenticate(user=self.client_user)

    def test_client_cannot_create_order_for_different_client(self):
        response = self.client.post(
            '/api/orders/orders/',
            {
                'title': 'Blocked order',
                'client': self.other_client.id,
                'tailor': self.tailor_user.id,
                'deadline': str((timezone.now() + timedelta(days=5)).date()),
                'items': [],
            },
            format='json',
        )
        self.assertEqual(response.status_code, 403)
