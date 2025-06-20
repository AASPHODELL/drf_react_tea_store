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

    def test_user_login_via_api(self):
        """Тест входа через API (получение токена)"""
        response = self.api_client.post(
            '/api/auth/login/',
            {'username': 'testuser', 'password': 'testpass123'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('auth_token', response.data)

    def test_admin_access(self):
        """Тест доступа администратора"""
        self.api_client.force_authenticate(user=self.admin)
        response = self.api_client.get('/api/admin/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unauthorized_access(self):
        """Тест неавторизованного доступа"""
        response = self.api_client.get('/api/admin/users/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_logout(self):
        """Тест выхода из системы"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get('/api/auth/logout/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn('_auth_user_id', self.client.session)


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

    def test_session_destroy_on_logout(self):
        """Тест очистки сессии при выходе"""
        self.client.login(username='testuser', password='testpass123')
        session_key = self.client.session.session_key
        self.client.get('/api/auth/logout/')
        self.assertFalse(self.client.session.get('_auth_user_id'))
        # Проверяем что сессия удалена из базы
        from django.contrib.sessions.models import Session
        with self.assertRaises(Session.DoesNotExist):
            Session.objects.get(session_key=session_key)

    def test_session_hijacking_protection(self):
        """Тест защиты от подмены сессии"""
        self.client.login(username='testuser', password='testpass123')
        session = self.client.session
        session['_auth_user_id'] = '100'  # Пытаемся подменить ID пользователя
        session.save()

        # Проверяем что система обнаруживает подмену
        with self.assertRaises(SuspiciousOperation):
            self.client.get('/api/profile/')


class RequestCleaningTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.api_client = APIClient()

    def test_xss_protection(self):
        """Тест защиты от XSS в GET параметрах"""
        malicious_script = "<script>alert('xss')</script>"
        response = self.client.get(f'/api/search/?q={malicious_script}')
        # Проверяем что скрипт был экранирован
        self.assertNotIn(malicious_script, str(response.content))
        self.assertIn('&lt;script&gt;', str(response.content))

    def test_sql_injection_protection(self):
        """Тест защиты от SQL инъекций"""
        injection = "' OR 1=1 --"
        response = self.api_client.get(f'/api/users/?username={injection}')
        # Должен вернуться пустой список, а не все пользователи
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_file_upload_validation(self):
        """Тест валидации загружаемых файлов"""
        # Создаем поддельный файл с PHP кодом
        from io import BytesIO
        malicious_file = BytesIO(b'<?php echo "hacked"; ?>')
        malicious_file.name = 'malicious.php'

        response = self.api_client.post(
            '/api/upload/',
            {'file': malicious_file},
            format='multipart'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('File extension', str(response.data))

    def test_clean_post_data(self):
        """Тест очистки POST данных"""
        dirty_data = {
            'name': '  Test User  ',  # Лишние пробелы
            'email': 'TEST@example.com',  # Должен быть приведен к lowercase
            'html': '<b>Test</b>',  # HTML теги
        }

        response = self.api_client.post(
            '/api/clean-data/',
            dirty_data,
            format='json'
        )

        # Проверяем что данные были очищены
        self.assertEqual(response.data['name'], 'Test User')
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertEqual(response.data['html'], '&lt;b&gt;Test&lt;/b&gt;')
