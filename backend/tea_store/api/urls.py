from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartItemViewSet

router = DefaultRouter() # Создаем роутер
router.register(r'cartitems', CartItemViewSet) # Регистрируем ViewSet с префиксом 'cartitems' (URL будут выглядеть как /api/cartitems/)

urlpatterns = [
    path('', include(router.urls)), # Включаем URL-адреса, сгенерированные роутером
]