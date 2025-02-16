from channels.generic.websocket import AsyncWebsocketConsumer
import json


class GameConsumer(AsyncWebsocketConsumer):
    active_users = set()

    async def connect(self):
        if len(self.active_users) >= 2:
            await self.close()
        else:
            self.active_users.add(self)
            await self.accept()

    async def disconnect(self, close_code):
        self.active_users.discard(self)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data["message"]

        await self.send(text_data=json.dumps({"message": message}))
