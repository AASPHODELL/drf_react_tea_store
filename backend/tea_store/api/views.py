from django.shortcuts import render

from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response

from .models import CartItem
from .serializer import CartItemSerializer

# Аввтоматическая реализация CRUD/филььтрации/поиска при помощи viewsets
class CartItemViewSet(viewsets.ModelViewSet): # !! Как оказалось, CartViewSet нельзя, а CartItemViewSet - можно. Видимо, это связано с тем, что объект в моделе называется CartItem
    """"Представление для профилей пользователей"""
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer): # Метод, который вызывается при создании
        serializer.save(author=self.request.user) # Записываем в поле author текущего аутентифицированного пользователя
