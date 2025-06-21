import django_filters
from .models import CartItem

class CartItemFilter(django_filters.FilterSet): # Переопределили класс для FilterSet чтобы искать больше чем X и меньше чем X
    product_price__gte = django_filters.NumberFilter(field_name='product_price', lookup_expr='gte')
    product_price__lte = django_filters.NumberFilter(field_name='product_price', lookup_expr='lte')

    class Meta:
        model = CartItem
        fields = ['product_price__gte', 'product_price__lte']