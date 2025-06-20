from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.core.exceptions import SuspiciousOperation

User = get_user_model()

class AuthTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.api_client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        self.admin = User.objects.create_superuser(
            username='admin',
            password='adminpass123',
            email='admin@example.com'
        )

    def test_user_login(self):
        """Тест входа пользователя через стандартный Django Client"""
        response = self.client.login(username='testuser', password='testpass123')
        self.assertTrue(response)
        self.assertIn('_auth_user_id', self.client.session)


    def test_admin_access(self):
        """Тест доступа администратора"""
        self.api_client.force_authenticate(user=self.admin)
        response = self.api_client.get('/admin/users/')
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)

class SessionTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_session_creation(self):
        """Тест создания сессии при входе"""
        self.client.login(username='testuser', password='testpass123')
        session = self.client.session
        self.assertTrue(session.session_key)
        self.assertEqual(int(session['_auth_user_id']), self.user.pk)