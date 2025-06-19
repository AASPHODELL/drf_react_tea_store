from rest_framework import serializers
from .models import CartItem

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(max_length=200)
    product_price = serializers.FloatField()
    product_quantity = serializers.IntegerField(required=False, default=1) # Если пользователь не указал количество товаров, то по уполчанию считаем, что он покупает 1 товар 

    class Meta: # Этот класс нужен для связи сериализатора с моделью Django, просто добавляем его для работы
        model = CartItem
        fields = ('__all__')