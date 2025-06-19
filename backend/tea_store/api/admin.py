from django.contrib import admin

from .models import CartItem

# Зарегистрировала модель для того, что бы к ней был доступ из админки
admin.site.register(CartItem)