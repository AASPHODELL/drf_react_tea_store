import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync 

class ProductConsumer(WebsocketConsumer):
    def connect(self): # Метод connect вызывается, когда устанавливается новое вебсокет соединение
        async_to_sync(self.channel_layer.group_add)(
            'products_updates',
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code): # Метод disconnect вызывается, когда вебсокет соединение закрывается 
        async_to_sync(self.channel_layer.group_discard)(
            'products_updates',
            self.channel_name
        )

    def product_update(self, event): # Мой хендлер сообщений
        self.send(text_data=json.dumps(event['message']))