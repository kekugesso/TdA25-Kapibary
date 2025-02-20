from copy import deepcopy
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from rest_framework.authtoken.models import Token
from .models import Game, GameStatus, Board
from .serializers import BoardSerializer, GameStatusSerializerView, GameSerializerMultiplayer
import json


class GameConsumer(AsyncWebsocketConsumer):
    tah = "X"

    async def connect(self):
        uuid = self.scope["url_route"]["kwargs"]["uuid"]
        await self.channel_layer.group_add(f"game_{uuid}", self.channel_name)
        await self.accept()
        data = await self.get_game(uuid)
        matrix = [["" for _ in range(15)] for _ in range(15)]
        for symbol in data.get("board", []):
            matrix[symbol["row"]][symbol["column"]] = symbol["symbol"]
        data["board"] = matrix
        await self.send(text_data=json.dumps(data))

    async def disconnect(self, close_code):
        uuid = self.scope["url_route"]["kwargs"]["uuid"]
        await self.channel_layer.group_discard(f"game_{uuid}", self.channel_name)

    async def receive(self, text_data):
        uuid = self.scope["url_route"]["kwargs"]["uuid"]
        data = json.loads(text_data)
        uuid_player = await self.get_user_from_token()
        control = await self.control_player(uuid, uuid_player)
        print(control)
        if control:
            data["symbol"] = await self.get_symbol(uuid, uuid_player)
            if (data["symbol"] == self.tah):
                if self.tah == "X":
                    self.tah = "O"
                else:
                    self.tah = "X"
                await self.save_board(data, uuid)
                board = await self.get_list_board
                win_probality = await self.check_winner(board)
                print(win_probality)
                await self.channel_layer.group_send(
                    f"game_{uuid}",
                    {
                        "type": "game_update",
                        "message": json.dumps(data)
                    }
                )
            else:
                pass
        else:
            pass


    @sync_to_async
    def save_board(self, data, uuid):
        serializer = BoardSerializer(data=data)
        if serializer.is_valid():
            serializer.save(game=uuid)

    @sync_to_async
    def get_game(self, uuid):
        game = Game.objects.get(uuid=uuid)
        return GameSerializerMultiplayer(game).data

    @sync_to_async
    def get_symbol(self, uuid_game, uuid_user):
        gamestatus = GameStatus.objects.filter(game=uuid_game, player=uuid_user).first()
        return gamestatus.symbol

    @sync_to_async
    def control_player(self, uuid_game, uuid_user):
        print(type(uuid_user))
        gamestatus = GameStatus.objects.filter(game=uuid_game)
        serializer = GameStatusSerializerView(gamestatus, many=True)
        players = []
        for gamestatus in serializer.data:
            players.append(gamestatus["player"]["uuid"])
        return uuid_user in players
    
    async def get_user_from_token(self):
        headers = dict(deepcopy(self.scope["headers"]))
        auth_header = headers.get(b"authorization", b"").decode("utf-8")

        if not auth_header.startswith("Token "):
            return None

        token_key = auth_header.split(" ")[1]

        return await self.get_user_by_token(token_key)

    @sync_to_async
    def get_user_by_token(self, token_key):
        try:
            token = Token.objects.get(key=token_key)
            return str(token.user.uuid)
        except Token.DoesNotExist:
            return None

    async def game_update(self, event):
        message = event["message"]
        await self.send(text_data=message)

    async def check_winner(self, board):
        SIZE = 15
        WIN_CONDITION = 5
        
        async def check_direction(x, y, dx, dy):
            mark = board[x][y]
            if mark == " ":
                return None
            
            positions = []
            for i in range(WIN_CONDITION):
                nx, ny = x + i * dx, y + i * dy
                if 0 <= nx < SIZE and 0 <= ny < SIZE and board[nx][ny] == mark:
                    positions.append({"row": nx, "col": ny})
                else:
                    return None
            return positions
        for x in range(SIZE):
            for y in range(SIZE):
                if board[x][y] != " ":
                    for dx, dy in [(1, 0), (0, 1), (1, 1), (1, -1)]:
                        result = check_direction(x, y, dx, dy)
                        if result:
                            return True, result
    
        return False, None

    @sync_to_async
    def get_list_board(game_uuid):
        game = Game.objects.get(uuid=game_uuid)
        boards = Board.objects.filter(game=game_uuid)
        serializer = BoardSerializer(boards, many=True)
        data = serializer.data
        matrix = [["" for _ in range(15)] for _ in range(15)]
        for symbol in data:
            matrix[symbol["row"]][symbol["column"]] = symbol["symbol"]
        data = matrix
        return data
