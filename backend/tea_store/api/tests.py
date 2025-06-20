from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import CartItem

User = get_user_model() # Получаем текущую активную модель пользователя

class CartItemTests(APITestCase):
    """
    Тесты для ViewSet CartItem и его логики разрешений.
    """

    def setUp(self):
        """
        Метод, который выполняется перед каждым тестом.
        Создаем тестовых пользователей и тестовые данные.
        """
        # Создаем обычного пользователя
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword'
        )
        # Создаем другого обычного пользователя
        self.another_user = User.objects.create_user(
            username='anotheruser',
            password='anotherpassword'
        )
        # Создаем администратора
        self.admin_user = User.objects.create_superuser(
            username='adminuser',
            password='adminpassword',
            email='admin@example.com'
        )

        # Создаем тестовую карточку товара, принадлежащую self.user
        self.cart_item = CartItem.objects.create(
            product_name="Тестовый Чай",
            product_price=10.50,
            product_quantity=2,
            author=self.user
        )
        # URL для списка и создания CartItem
        self.list_url = reverse('cartitem-list')
        # URL для деталей, обновления и удаления конкретного CartItem
        self.detail_url = reverse('cartitem-detail', args=[self.cart_item.id])

        # Данные для создания нового CartItem
        self.valid_payload = {
            'product_name': 'Новый Чай',
            'product_price': 15.00,
            'product_quantity': 5
        }
        # Данные для обновления CartItem
        self.update_payload = {
            'product_name': 'Обновленный Чай',
            'product_price': 20.00,
            'product_quantity': 3
        }
        # Данные для обновления CartItem (частично)
        self.partial_update_payload = {
            'product_price': 25.00
        }

    # --- Тесты для неаутентифицированных пользователей (гостей) ---

    def test_guest_can_list_cart_items(self):
        """Гость может получить список карточек товаров (READ)."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Убедимся, что возвращенный список содержит наш тестовый элемент
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['product_name'], self.cart_item.product_name)

    def test_guest_can_retrieve_cart_item(self):
        """Гость может просматривать детали конкретной карточки товара (READ)."""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['product_name'], self.cart_item.product_name)

    def test_guest_cannot_create_cart_item(self):
        """Гость НЕ может создавать карточки товаров (CREATE)."""
        response = self.client.post(self.list_url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(CartItem.objects.count(), 1) # Убедимся, что новый элемент не создан

    def test_guest_cannot_update_cart_item(self):
        """Гость НЕ может обновлять карточки товаров (UPDATE)."""
        response = self.client.put(self.detail_url, self.update_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        # Убедимся, что данные не изменились
        self.cart_item.refresh_from_db()
        self.assertEqual(self.cart_item.product_price, 10.50)

    def test_guest_cannot_delete_cart_item(self):
        """Гость НЕ может удалять карточки товаров (DELETE)."""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(CartItem.objects.count(), 1) # Убедимся, что элемент не удален

    # --- Тесты для аутентифицированных пользователей (НЕ владельцев и НЕ админов) ---

    def test_authenticated_user_can_list_cart_items(self):
        """Аутентифицированный пользователь может получить список карточек."""
        self.client.force_authenticate(user=self.another_user) # Логинимся
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_authenticated_user_can_retrieve_cart_item(self):
        """Аутентифицированный пользователь может просматривать детали карточки."""
        self.client.force_authenticate(user=self.another_user)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_authenticated_user_can_create_cart_item(self):
        """Аутентифицированный пользователь может создавать карточки товаров."""
        self.client.force_authenticate(user=self.another_user)
        response = self.client.post(self.list_url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CartItem.objects.count(), 2) # Один был в setUp, один только что создан
        new_item = CartItem.objects.get(product_name='Новый Чай')
        self.assertEqual(new_item.author, self.another_user) # Проверяем, что автор установлен верно

    def test_authenticated_user_cannot_update_others_cart_item(self):
        """Аутентифицированный пользователь НЕ может обновлять чужие карточки."""
        self.client.force_authenticate(user=self.another_user)
        response = self.client.put(self.detail_url, self.update_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) # Ошибка "Запрещено"
        self.cart_item.refresh_from_db()
        self.assertEqual(self.cart_item.product_price, 10.50) # Данные не изменились

    def test_authenticated_user_cannot_delete_others_cart_item(self):
        """Аутентифицированный пользователь НЕ может удалять чужие карточки."""
        self.client.force_authenticate(user=self.another_user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(CartItem.objects.count(), 1)

    # --- Тесты для владельцев карточек ---

    def test_owner_can_update_cart_item(self):
        """Владелец может обновлять свою карточку."""
        self.client.force_authenticate(user=self.user) # Логинимся как владелец
        response = self.client.put(self.detail_url, self.update_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.cart_item.refresh_from_db()
        self.assertEqual(self.cart_item.product_price, self.update_payload['product_price'])

    def test_owner_can_partially_update_cart_item(self):
        """Владелец может частично обновлять свою карточку."""
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(self.detail_url, self.partial_update_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.cart_item.refresh_from_db()
        self.assertEqual(self.cart_item.product_price, self.partial_update_payload['product_price'])
        self.assertEqual(self.cart_item.product_name, "Тестовый Чай") # Убедимся, что другие поля не изменились

    def test_owner_can_delete_cart_item(self):
        """Владелец может удалять свою карточку."""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT) # 204 No Content при успешном удалении
        self.assertEqual(CartItem.objects.count(), 0)

    # --- Тесты для администраторов ---

    def test_admin_can_list_cart_items(self):
        """Админ может получить список карточек."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_admin_can_retrieve_cart_item(self):
        """Админ может просматривать детали карточки."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_can_create_cart_item(self):
        """Админ может создавать карточки товаров."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(self.list_url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CartItem.objects.count(), 2)
        new_item = CartItem.objects.get(product_name='Новый Чай')
        self.assertEqual(new_item.author, self.admin_user) # Проверяем, что автор установлен верно

    def test_admin_can_update_any_cart_item(self):
        """Админ может обновлять любую карточку."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.put(self.detail_url, self.update_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.cart_item.refresh_from_db()
        self.assertEqual(self.cart_item.product_price, self.update_payload['product_price'])

    def test_admin_can_delete_any_cart_item(self):
        """Админ может удалять любую карточку."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CartItem.objects.count(), 0)

    # --- Тест для проверки дефолтного значения product_quantity ---
    def test_product_quantity_default(self):
        """Проверяем, что product_quantity по умолчанию устанавливается в 1."""
        self.client.force_authenticate(user=self.user)
        payload_without_quantity = {
            'product_name': 'Чай без количества',
            'product_price': 7.77
        }
        response = self.client.post(self.list_url, payload_without_quantity, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_item = CartItem.objects.get(product_name='Чай без количества')
        self.assertEqual(new_item.product_quantity, 1) # Должно быть 1 по умолчанию