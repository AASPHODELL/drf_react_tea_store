from django.shortcuts import render

from rest_framework import viewsets, permissions

from .models import CartItem
from .serializer import CartItemSerializer
from .permissions import IsOwnerOrReadOnly

# Аввтоматическая реализация CRUD/филььтрации/поиска при помощи viewsets
class CartItemViewSet(viewsets.ModelViewSet): # !! Как оказалось, CartViewSet нельзя, а CartItemViewSet - можно. Видимо, это связано с тем, что объект в моделе называется CartItem
    "Представление для карточек товаров"
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsOwnerOrReadOnly | permissions.IsAdminUser] # Карточку может редактировать только владелец, смотреть могут все ИЛИ (|) админ может всё

    def perform_create(self, serializer): # Метод, который вызывается при создании
        serializer.save(author=self.request.user) # Записываем в поле author текущего аутентифицированного пользователя
