from django.db import models
from django.conf import settings

# Модель для карточки товара в магазине
class CartItem(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart_items')
    # settings.AUTH_USER_MODEL - сссылка на пользователя, on_delete=models.CASCADE - если удалить пользователя, то и все cart_items будут удалены, 
    # related_name='cart_items' - имя, по которому можно будет получить все CartItems'ы пользователя (например, user.cart_items.all())
    product_name = models.CharField(max_length=200)
    product_price = models.FloatField()
    product_quantity = models.PositiveIntegerField()