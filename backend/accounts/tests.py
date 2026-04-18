from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class AuthApiTests(APITestCase):
    def test_register_and_login_with_email(self):
        register_payload = {
            'email': 'client@example.com',
            'full_name': 'Client One',
            'role': User.Role.CLIENT,
            'password': 'SecurePass123!',
            'password2': 'SecurePass123!',
        }
        register_response = self.client.post('/api/auth/register/', register_payload, format='json')
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='client@example.com').exists())

        login_payload = {'email': 'client@example.com', 'password': 'SecurePass123!'}
        login_response = self.client.post('/api/auth/login/', login_payload, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        payload = login_response.data.get('data', login_response.data)
        self.assertIn('access', payload)
        self.assertIn('refresh', payload)

    def test_register_disallows_admin_role(self):
        payload = {
            'email': 'admin-like@example.com',
            'full_name': 'Admin Like',
            'role': User.Role.ADMIN,
            'password': 'SecurePass123!',
            'password2': 'SecurePass123!',
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_accepts_case_insensitive_email(self):
        User.objects.create_user(
            email='mixedcase@example.com',
            full_name='Mixed Case',
            role=User.Role.CLIENT,
            password='SecurePass123!',
        )

        login_payload = {'email': '  MIXEDCASE@EXAMPLE.COM ', 'password': 'SecurePass123!'}
        login_response = self.client.post('/api/auth/login/', login_payload, format='json')

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        payload = login_response.data.get('data', login_response.data)
        self.assertIn('access', payload)
        self.assertIn('refresh', payload)

    def test_login_accepts_username(self):
        User.objects.create_user(
            email='username-login@example.com',
            username='TailorPro',
            full_name='Tailor Pro',
            role=User.Role.TAILOR,
            password='SecurePass123!',
        )

        login_payload = {'username': 'tailorpro', 'password': 'SecurePass123!'}
        login_response = self.client.post('/api/auth/login/', login_payload, format='json')

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        payload = login_response.data.get('data', login_response.data)
        self.assertIn('access', payload)
        self.assertIn('refresh', payload)
