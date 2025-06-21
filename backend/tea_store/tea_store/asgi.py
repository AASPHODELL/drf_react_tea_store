"""
ASGI config for tea_store project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

from api import routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tea_store.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(), # Обычные HTTP-запросы обрабатывает Django WSGI
    "websocket": AllowedHostsOriginValidator( # WebSockets обрабатывает Channels
        AuthMiddlewareStack(
            URLRouter(
                routing.websocket_urlpatterns # Используем маршруты из routing.py
            )
        )
    ),
})
