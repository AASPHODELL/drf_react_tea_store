from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/products/$', consumers.ProductConsumer.as_asgi()), # Этот URL будет слушать наш WebSocket-консьюмер
]