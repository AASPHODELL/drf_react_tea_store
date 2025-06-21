from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CartItem
from .serializer import CartItemSerializer

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

@receiver(post_save, sender=CartItem)
def product_saved(sender, instance, created, **kwargs):
    serializer = CartItemSerializer(instance) 
    data = serializer.data

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'products_updates',
        {
            'type': 'product_update',
            'message': data
        }
    )