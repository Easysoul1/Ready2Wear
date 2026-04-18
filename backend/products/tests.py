from django.test import TestCase

from accounts.models import User
from vendors.models import FabricItem, VendorProfile

from .models import Product
from .services import add_to_cart, checkout_cart


class MarketplaceCheckoutTests(TestCase):
    def setUp(self):
        self.vendor_user = User.objects.create_user(
            email='vendor-market@example.com',
            username='vendor_market',
            role=User.Role.VENDOR,
            password='VendorPass123!',
        )
        self.buyer_user = User.objects.create_user(
            email='buyer@example.com',
            username='buyer_one',
            role=User.Role.CLIENT,
            password='BuyerPass123!',
        )
        self.vendor_profile = VendorProfile.objects.create(user=self.vendor_user, business_name='Market Vendor')
        self.fabric = FabricItem.objects.create(
            vendor=self.vendor_profile,
            sku='FAB-MKT-1',
            name='Ankara Premium',
            fabric_type='Cotton',
            colour='Multi',
            stock_quantity=20,
            unit_price=7500,
        )
        self.product = Product.objects.create(
            fabric=self.fabric,
            title='Ankara Premium Roll',
            description='High-quality Ankara fabric.',
        )

    def test_checkout_reduces_stock_and_creates_marketplace_order(self):
        add_to_cart(user=self.buyer_user, product_id=self.product.id, quantity=2)
        marketplace_orders = checkout_cart(user=self.buyer_user)
        self.assertEqual(len(marketplace_orders), 1)
        self.fabric.refresh_from_db()
        self.assertEqual(str(self.fabric.stock_quantity), '18.00')
