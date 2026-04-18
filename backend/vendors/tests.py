from django.test import TestCase
from rest_framework.exceptions import ValidationError

from accounts.models import User

from .models import FabricItem, PriceHistory, VendorProfile
from .services import adjust_fabric_stock, update_fabric_price


class VendorServiceTests(TestCase):
    def setUp(self):
        self.vendor_user = User.objects.create_user(
            email='vendor@example.com',
            username='vendor_one',
            role=User.Role.VENDOR,
            password='VendorPass123!',
        )
        self.profile = VendorProfile.objects.create(
            user=self.vendor_user,
            business_name='Vendor One',
        )
        self.fabric = FabricItem.objects.create(
            vendor=self.profile,
            sku='SKU-1',
            name='Adire Cotton',
            fabric_type='Cotton',
            colour='Blue',
            stock_quantity=10,
            unit_price=5000,
        )

    def test_adjust_stock_blocks_negative_inventory(self):
        with self.assertRaises(ValidationError):
            adjust_fabric_stock(
                fabric_id=self.fabric.id,
                quantity_delta='-100',
                actor=self.vendor_user,
                reason='invalid reduction',
            )

    def test_price_update_logs_history(self):
        update_fabric_price(fabric_id=self.fabric.id, new_price='6500', actor=self.vendor_user)
        self.fabric.refresh_from_db()
        self.assertEqual(str(self.fabric.unit_price), '6500.00')
        self.assertEqual(PriceHistory.objects.filter(fabric=self.fabric).count(), 1)
