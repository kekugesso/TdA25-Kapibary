import random
import string
import math
from typing import List, Optional
from copy import deepcopy
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from rest_framework.authtoken.models import Token
from .models import Game, GameStatus, Board, CustomUser
from .serializers import BoardSerializer, GameStatusSerializerView, GameSerializerMultiplayer, GameStatusForUserSerializerView, GameStatusSerializerCreate, GameSerializer
import json
import time


class GameConsumer(AsyncWebsocketConsumer):
    data = {}

    async def connect(self):
        uuid = self.scope["url_route"]["kwargs"]["uuid"]
        if(uuid not in self.data):
            self.data[uuid] = {"tah": "X", "anonymous": "", "count_users": 1, "end": None, "draw_to": "", "rematch_to": "", "friendly": False}
            friendly = await self.is_friendly(uuid)
            if(friendly):
                self.data[uuid]["friendly"] = True
            else:
                self.data[uuid]["friendly"] = False
                self.data[uuid]["timer"] = await self.get_users_game_for_timer(uuid)
        if(uuid in self.data):
            self.data[uuid]["count_users"] += 1
            if(self.data[uuid]["count_users"] == 2 and not self.data[uuid]["friendly"]):
                self.data[uuid]["start_time"] = time.time()
            if(self.data[uuid]["friendly"]):
                token = await self.get_user_from_token()
                control_token = await self.is_valid_token(token)
                if not control_token:
                    self.data[uuid]["anonymous"] = token
        await self.channel_layer.group_add(f"game_{uuid}", self.channel_name)
        await self.accept()
        game = await self.get_game(uuid)
        gamedata = await self.get_game_data(uuid)
        matrix = [["" for _ in range(15)] for _ in range(15)]
        for symbol in gamedata.get("board", []):
            matrix[symbol["row"]][symbol["column"]] = symbol["symbol"]
        gamedata["board"] = matrix
        if(game.anonymousToken is not None):
            self.data[uuid]["anonymous"] = game.anonymousToken
        gamedata["type"] = "initData"
        await self.send(text_data=json.dumps(gamedata, default=str))

    async def disconnect(self, close_code):
        uuid = self.scope["url_route"]["kwargs"]["uuid"]
        await self.channel_layer.group_discard(f"game_{uuid}", self.channel_name)

    async def receive(self, text_data):
        send = True
        uuid = self.scope["url_route"]["kwargs"]["uuid"]
        data = json.loads(text_data)
        game_data = self.data[uuid]
        token = await self.get_user_from_token()
        if(token is not None):
            control_token = await self.is_valid_token(token)
            if control_token:
                uuid_player = await self.get_token(token)
            else:
                uuid_player = game_data["anonymous"]
        else:
            uuid_player = None
        if(data.get("surrender") == True):
            if(await self.control_if_player(uuid, uuid_player)):
                if(game_data["end"] is None):
                    data["type"] = "surrender"
                    game_data["end"] = await self.get_end_dict(uuid_player, "lose", "surrender", uuid, game_data["friendly"])
                    opponent_uuid = await self.get_opponent(uuid_player, uuid)
                    await self.write_result_to_db(uuid, opponent_uuid, uuid_player, "lose", game_data["friendly"])
                else:
                    send = False
            else:
                send = False
        elif("rematch" in data):
            if(await self.control_if_player(uuid, uuid_player)):
                if(game_data["end"] is not None):
                    data["type"] = "rematch"
                    if(game_data["rematch_to"] == ""):
                        opponent_uuid = await self.get_opponent(uuid_player, uuid)
                        data["rematch_to"] = opponent_uuid
                        game_data["rematch_to"] = opponent_uuid
                    else:
                        if(data.get("rematch") == False):
                            game_data["rematch_to"] = ""
                        else:
                            if((game_data["rematch_to"] == "anonymous" and uuid_player == self.data[uuid]["anonymous"]) or uuid_player == game_data["rematch_to"]):
                                data["new_game"] = await sync_to_async(self.create_new_game)(uuid_player, uuid, game_data["friendly"], game_data["anonymous"])
                else:
                    send = False
            else:
                send = False
        else:
            control = await self.control_player(uuid, uuid_player, game_data["tah"])
            if control:
                if("draw" in data):
                    if(game_data["end"] is None):
                        data["type"] = "draw"
                        if(game_data["draw_to"] == ""):
                            opponent_uuid = await self.get_opponent(uuid_player, uuid)
                            data["draw_to"] = opponent_uuid
                            game_data["draw_to"] = opponent_uuid
                        else:
                            if((game_data["draw_to"] == "anonymous" and uuid_player == self.data[uuid]["anonymous"]) or uuid_player == game_data["draw_to"]):
                                game_data["end"] = await self.get_end_dict(uuid_player, "draw", "agreed", uuid, game_data["friendly"])
                                opponent_uuid = await self.get_opponent(uuid_player, uuid)
                                await self.write_result_to_db(uuid, opponent_uuid, uuid_player, "draw", game_data["friendly"])
                            else:
                                game_data["draw_to"] = ""
                                data["draw"] = False
                    else:
                        send = False
                elif(data.get("row") is not None and data.get("column") is not None and not await sync_to_async(self.if_cell_exist)(uuid, data["row"], data["column"]) and game_data["end"] is None):
                    data["type"] = "new_symbol"
                    if not game_data["friendly"]:
                        spend_time = int(time.time() - game_data["start_time"])
                        game_data["timer"][game_data["tah"]]["time"] -= spend_time
                        if(game_data["timer"][game_data["tah"]]["time"] <= 0):
                            game_data["end"] = await self.get_end_dict(uuid_player, "lose", "timeout", uuid, game_data["friendly"])
                            opponent_uuid = await self.get_opponent(uuid_player, uuid)
                            await self.write_result_to_db(uuid, opponent_uuid, uuid_player, "lose", False)
                        else:
                            game_data["start_time"] = time.time()
                        data["time"] = game_data["timer"][game_data["tah"]]["time"]
                    data["symbol"] = game_data["tah"]
                    if(game_data["end"] is None):
                        await self.save_board(data, uuid)
                        board = await self.get_list_board(uuid)
                    win_probality = await self.get_winning_board(board, 5, game_data["tah"])
                    if win_probality is not None:
                        game_data["end"] = await self.get_end_dict(uuid_player, "win", "symbol", uuid, game_data["friendly"])
                        opponent_uuid = await self.get_opponent(uuid_player, uuid)
                        await self.write_result_to_db(uuid, uuid_player,  opponent_uuid, "win", game_data["friendly"])
                        await sync_to_async(self.save_win_board)(uuid, win_probality)
                        game_data["end"]["win_board"] = win_probality
                    is_draw = await self.is_draw_board(uuid)
                    if is_draw and game_data["end"] is None:
                        game_data["end"] = await self.get_end_dict(uuid_player, "draw", "draw", uuid, game_data["friendly"])
                        opponent_uuid = await self.get_opponent(uuid_player, uuid)
                        await self.write_result_to_db(uuid, uuid_player, opponent_uuid, "draw", game_data["friendly"])
                    if game_data["tah"] == "X":
                        game_data["tah"] = "O"
                    else:
                        game_data["tah"] = "X"
                else:
                    send = False
            else:
                send = False
        if(send):
            data["end"] = game_data["end"]
            await self.channel_layer.group_send(
                f"game_{uuid}",
                {
                    "type": "game_update",
                    "message": json.dumps(data)
                }
            )
        else:
            pass


    @sync_to_async
    def save_board(self, data, uuid):
        data["game"] = uuid
        serializer = BoardSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
        data.pop("game")

    @sync_to_async
    def get_game(self, uuid):
        return Game.objects.get(uuid=uuid)

    @sync_to_async
    def get_game_data(self, uuid):
        game = Game.objects.get(uuid=uuid)
        serializer = GameSerializerMultiplayer(game)
        data = serializer.data
        return data

    @sync_to_async
    def get_symbol(self, uuid_game, uuid_user):
        gamestatus = GameStatus.objects.filter(game=uuid_game, player=uuid_user, result="unknown").first()
        return gamestatus.symbol

    @sync_to_async
    def control_player(self, uuid_game, uuid_user, tah):
        gamestatus = GameStatus.objects.filter(game=uuid_game)
        serializer = GameStatusSerializerView(gamestatus, many=True)
        players = []
        for gamestatus in serializer.data:
            players.append(gamestatus["player"]["uuid"])
        if(len(players) < 2):
            if(uuid_user not in players):
                if(uuid_user == self.data[uuid_game]["anonymous"]):
                    gamestatus = GameStatus.objects.filter(player=players[0], result="unknown").first()
                    if(tah != gamestatus.symbol):
                        return True
            else:
                gamestatus = GameStatus.objects.filter(player=uuid_user, result="unknown").first()
                if(tah == gamestatus.symbol):
                    return True
        else:
            if(uuid_user in players):
                gamestatususer = GameStatus.objects.filter(player=uuid_user, result="unknown").first()
                return gamestatususer.symbol == tah
        return False

    async def get_user_from_token(self):
        headers = dict(deepcopy(self.scope["headers"]))
        cookies = {cookie.split("=")[0]: cookie.split("=")[1] 
                   for cookie in headers.get(b"cookie", b"").decode().split("; ") if "=" in cookie}

        auth_token = cookies.get("authToken", None)

        return auth_token


    @sync_to_async
    def get_token(self, token_key):
        try:
            token = Token.objects.get(key=token_key)
            return str(token.user.uuid)
        except Token.DoesNotExist:
            return None

    async def game_update(self, event):
        message = event["message"]
        await self.send(text_data=message)

    async def get_winning_board(self, board: List[List[str]], winning: int, turn: str) -> Optional[List[List[str]]]:
        """     
        check if the board has 'winning' number of 'X' or 'O' in a row
        if it does it adds 'w' at the end of the position and returns the board
        else return null
        """
        
        # functions to handle wins
        def horizontal_win(r: int, c: int) -> List[List[str]]:
            for k in range(winning):
                board[r][c - k] += "w"
            return board

        def vertical_win(r: int, c: int) -> List[List[str]]:
            for k in range(winning):
                board[r - k][c] += "w"
            return board

        def diagonal_win(r: int, c: int) -> List[List[str]]:
            for k in range(winning):
                board[r - k][c - k] += "w"
            return board

        def anti_diagonal_win(r: int, c: int) -> List[List[str]]:
            for k in range(winning):
                board[r - k][c + k] += "w"
            return board

        rows = len(board)
        cols = len(board[0]) if rows > 0 else 0

        for row in range(rows):
            for col in range(cols):
                count_horizontal = 0
                count_vertical = 0
                count_diagonal = 0
                count_anti_diagonal = 0

                # Horizontal Check
                for k in range(winning):
                    if col + k < cols and board[row][col + k] == turn:
                        count_horizontal += 1
                    else:
                        break
                if count_horizontal == winning:
                    return horizontal_win(row, col + winning - 1)

                # Vertical Check
                for k in range(winning):
                    if row + k < rows and board[row + k][col] == turn:
                        count_vertical += 1
                    else:
                        break
                if count_vertical == winning:
                    return vertical_win(row + winning - 1, col)

                # Diagonal Check
                for k in range(winning):
                    if row + k < rows and col + k < cols and board[row + k][col + k] == turn:
                        count_diagonal += 1
                    else:
                        break
                if count_diagonal == winning:
                    return diagonal_win(row + winning - 1, col + winning - 1)

                # Anti-Diagonal Check
                for k in range(winning):
                    if row + k < rows and col - k >= 0 and board[row + k][col - k] == turn:
                        count_anti_diagonal += 1
                    else:
                        break
                if count_anti_diagonal == winning:
                    return anti_diagonal_win(row + winning - 1, col - winning + 1)

        return None

    @sync_to_async
    def get_list_board(self, game_uuid):
        game = Game.objects.get(uuid=game_uuid)
        boards = Board.objects.filter(game=game_uuid)
        serializer = BoardSerializer(boards, many=True)
        data = serializer.data
        matrix = [["" for _ in range(15)] for _ in range(15)]
        for symbol in data:
            matrix[symbol["row"]][symbol["column"]] = symbol["symbol"]
        data = matrix
        return data
    @sync_to_async
    def is_friendly(self, game_uuid):
        game_type = Game.objects.get(uuid=game_uuid).gameType
        return game_type == "friendly"
    
    @sync_to_async
    def is_valid_token(self, token):
        try:
            Token.objects.get(key=token)
            return True
        except Token.DoesNotExist:
            return False
    
    @sync_to_async
    def get_users_game_for_timer(self, uuid_game):
        gamestatus = GameStatus.objects.filter(game=uuid_game)
        serializer = GameStatusSerializerView(gamestatus, many=True)
        players = {}
        for gamestatus in serializer.data:
            hello = {}
            hello["uuid"] = gamestatus["player"]["uuid"]
            hello["time"] = 480
            hello["result"] = "unknown"
            players[gamestatus["symbol"]] = hello
        return players
    
    async def get_end_dict(self, uuid_player, end, reason, game_uuid, friendly):
        resultjson = {}
        opponent_uuid = await self.get_opponent(uuid_player, game_uuid)
        player_symbol = ""
        opponent_symbol = ""
        if(friendly):
            if(uuid_player == self.data[game_uuid]["anonymous"]):
                opponent_symbol = await self.get_symbol(game_uuid, opponent_uuid)
                if(opponent_symbol == "X"):
                    player_symbol = "O"
                else:
                    player_symbol = "X"
            elif(opponent_uuid == "anonymous"):
                if(player_symbol == "X"):
                    opponent_symbol = "O"
                else:
                    opponent_symbol = "X"
            else:
                player_symbol = await self.get_symbol(game_uuid, uuid_player)
                opponent_symbol = await self.get_symbol(game_uuid, opponent_uuid)
        else:
            opponent_symbol = await self.get_symbol(game_uuid, opponent_uuid)
            player_symbol = await self.get_symbol(game_uuid, uuid_player)
        win_uuid = ""
        lose_uuid = ""
        if(end == "win"):
            win_symbol = player_symbol
            win_uuid = uuid_player
            lose_uuid = opponent_uuid
            lose_symbol = opponent_symbol
        elif(end == "lose"):
            win_symbol = opponent_symbol
            win_uuid = opponent_uuid
            lose_uuid = uuid_player
            lose_symbol = player_symbol
        elif(end == "draw"):
            if(reason == "deska"):
                resultjson[player_symbol] = {"result": "draw",
                                        "message": "Hrací plocha byla naplňěná symboly."}
                resultjson[opponent_symbol] = {"result": "draw",
                                        "message": "Hrací plocha byla naplňěná symboly."}
            elif(reason == "agreed"):
                resultjson[player_symbol] = {"result": "draw",
                                        "message": "Po dohodě hráčů je remiza."}
                resultjson[opponent_symbol] = {"result": "draw",
                                        "message": "Po dohodě hráčů je remiza."}
        if(reason == "timeout"):
            resultjson[win_symbol] = {"result": "win",
                                    "message": "U soupeře vypršel čas."}
            resultjson[lose_symbol] = {"result": "lose",
                                    "message": "U tebe vypršel čas"}
        elif(reason == "surrender"):
            resultjson[win_symbol] = {"result": "win",
                                    "message": "Soupeř se vzdal."}
            resultjson[lose_symbol] = {"result": "lose",
                                    "message": "Vzdal ses."}
        elif(reason == "symbol"):
            resultjson[win_symbol] = {"result": "win",
                                    "message": "Složil jsi 5 symbolů do řady."}
            resultjson[lose_symbol] = {"result": "lose",
                                    "message": "Soupeř složil 5 symbolů do řady."}
        return resultjson

    @sync_to_async
    def get_opponent(self, uuid_player, uuid_game):
        game = Game.objects.get(uuid=uuid_game)
        data = GameSerializerMultiplayer(game).data
        gameStatus = data["game_status"]
        data = []
        for game_status in gameStatus:
            games = GameStatus.objects.filter(game=game_status["game"])
            serializer = GameStatusForUserSerializerView(games, many=True)
            data.append(serializer.data)
        result = []
        for game in data:
            hello = {}
            if(len(game) < 2):
                hello["player1"] = game[0]
            else:
                hello["player1"] = game[0]
                hello["player2"] = game[1]
            result.append(hello)
        result = result[0]
        if(result.get("player2") is None):
            if(uuid_player == self.data[uuid_game]["anonymous"]):
                return result["player1"]["player"]["uuid"]
            else:
                return "anonymous"
        else:
            if(uuid_player == result["player1"]["player"]["uuid"]):
                return result["player2"]["player"]["uuid"]
            else:
                return result["player1"]["player"]["uuid"]
    
    def get_opponent_sync(self, uuid_player, uuid_game, friendly):
        game = Game.objects.get(uuid=uuid_game)
        data = GameSerializerMultiplayer(game).data
        gameStatus = data["game_status"]
        data = []
        for game_status in gameStatus:
            games = GameStatus.objects.filter(game=game_status["game"])
            serializer = GameStatusForUserSerializerView(games, many=True)
            data.append(serializer.data)
        result = []
        for game in data:
            hello = {}
            if(len(game) < 2):
                hello["player1"] = game[0]
            else:
                hello["player1"] = game[0]
                hello["player2"] = game[1]
            result.append(hello)
        result = result[0]
        if(result.get("player2") is None):
            if(uuid_player == self.data[uuid_game]["anonymous"]):
                return result["player1"]["player"]["uuid"]
            else:
                return "anonymous"
        else:
            if(uuid_player == result["player1"]["player"]["uuid"]):
                return result["player2"]["player"]["uuid"]
            else:
                return result["player1"]["player"]["uuid"]
    
    @sync_to_async
    def is_draw_board(self, game_uuid):
        game = Game.objects.get(uuid=game_uuid)
        boards = Board.objects.filter(game=game_uuid)
        serializer = BoardSerializer(boards, many=True)
        data = serializer.data
        if(len(data) == 225):
            return True
        return False

    @sync_to_async
    def write_result_to_db(self,  game_uuid, win_uuid, lose_uuid, result, friendly):
        def get_elo_difference(uuid_player, uuid_game, result):
            game_status = GameStatus.objects.get(game=uuid_game, player=uuid_player)
            uuid_opponent = self.get_opponent_sync(uuid_player=uuid_player, uuid_game=uuid_game, friendly=False)
            opponent = GameStatus.objects.get(player=uuid_opponent, game=uuid_game)
            elo_opponent = opponent.elo
            games = GameStatus.objects.filter(player_id=uuid_player)
            count_win = 0
            count_lose = 0
            count_draw = 0
            for game in games:
                if game.result == "win":
                    count_win += 1
                elif game.result == "lose":
                    count_lose += 1
                elif game.result == "draw":
                    count_draw += 1
            if(result == "win"):
                sa = 1
            elif(result == "lose"):
                sa = 0
            elif(result == "draw"):
                sa = 0.5
            ea = 1/(1+10**((elo_opponent-game_status.elo)/400))
            saea = sa - ea
            if(count_draw == 0 and count_lose == 0 and count_win == 0):
                podilher = 0.5
            else:
                podilher = (count_win+count_draw)/(count_win+count_lose+count_draw)
            new_elo = float(game_status.elo) + 40*(saea*(1 + 0.5*(0.5-podilher)))
            if(new_elo < 0):
                new_elo = 0
            user = CustomUser.objects.get(uuid=uuid_player)
            user.elo = new_elo
            user.save()
            elodifference = new_elo - game_status.elo
            return math.ceil(elodifference)

        if(not friendly):
            if(result == "draw"):
                elodifference = get_elo_difference(win_uuid, game_uuid, "draw")
                gamestatus = GameStatus.objects.get(game=game_uuid, player=win_uuid)
                gamestatus.result = "draw"
                gamestatus.elodifference = elodifference
                gamestatus.save()
                elodifference = get_elo_difference(lose_uuid, game_uuid, "draw")
                gamestatus = GameStatus.objects.get(game=game_uuid, player=lose_uuid)
                gamestatus.result = "draw"
                gamestatus.elodifference = elodifference
                gamestatus.save()
            else:
                elodifference = get_elo_difference(win_uuid, game_uuid, "win")
                gamestatus = GameStatus.objects.get(game=game_uuid, player=win_uuid)
                gamestatus.result = "win"
                gamestatus.elodifference = elodifference
                gamestatus.save()
                elodifference = get_elo_difference(lose_uuid, game_uuid, "lose")
                gamestatus = GameStatus.objects.get(game=game_uuid, player=lose_uuid)
                gamestatus.result = "lose"
                gamestatus.elodifference = elodifference
                gamestatus.save()
        else:
            if(self.data[game_uuid]["anonymous"] != ""):
                if(result == "draw"):
                    if(win_uuid == self.data[game_uuid]["anonymous"]):
                        player_uuid = lose_uuid
                    else:
                        player_uuid = win_uuid
                    gamestatus = GameStatus.objects.filter(game=game_uuid, player=player_uuid, result="unknown").first()
                    gamestatus.result = "draw"
                    gamestatus.save()
                else:
                    if(win_uuid == self.data[game_uuid]["anonymous"]):
                        player_uuid = lose_uuid
                        gamestatus = GameStatus.objects.filter(game=game_uuid, player=lose_uuid, result="unknown").first()
                        gamestatus.result = "lose"
                        gamestatus.save()
                    elif(lose_uuid == self.data[game_uuid]["anonymous"]):
                        player_uuid = win_uuid
                        gamestatus = GameStatus.objects.filter(game=game_uuid, player=player_uuid, result="unknown").first()
                        gamestatus.result = "win"
                        gamestatus.save()
            else:
                if(result == "draw"):
                    gamestatus = GameStatus.objects.filter(game=game_uuid, player=win_uuid, result="unknown").first()
                    gamestatus.result = "draw"
                    gamestatus.save()
                    gamestatus = GameStatus.objects.filter(game=game_uuid, player=lose_uuid, result="unknown").first()
                    gamestatus.result = "draw"
                    gamestatus.save()
                else:
                    gamestatus = GameStatus.objects.filter(game=game_uuid, player=win_uuid, result="unknown").first()
                    gamestatus.result = "win"
                    gamestatus.save()
                    gamestatus = GameStatus.objects.filter(game=game_uuid, player=lose_uuid, result="unknown").first()
                    gamestatus.result = "lose"
                    gamestatus.save()

    @sync_to_async
    def control_if_player(self, uuid_game, uuid_user):
        gamestatus = GameStatus.objects.filter(game=uuid_game)
        serializer = GameStatusSerializerView(gamestatus, many=True)
        players = []
        for gamestatus in serializer.data:
            players.append(gamestatus["player"]["uuid"])
        return uuid_user in players or uuid_user == self.data[uuid_game]["anonymous"]

    def create_new_game(self, uuid_user, uuid_game, friendly, anonymous):
        opponent = self.get_opponent_sync(uuid_user, uuid_game, False)
        if(friendly):
            game_type = "friendly"
            anonymousToken = anonymous
        else:
            game_type = "rating"
            anonymousToken = None 
        data = {
            "name": ''.join(random.choices(string.ascii_letters, k=10)),
            "gameType": game_type,
            "anonymousToken": anonymousToken
        }

        serializer = GameSerializer(data=data)
        if serializer.is_valid():
            game_instance = serializer.save()  # Save and keep reference
        if(uuid_user == self.data[uuid_game]["anonymous"] or opponent == "anonymous"):
            if(uuid_user == self.data[uuid_game]["anonymous"]):
                user = CustomUser.objects.get(uuid=opponent)
                game_status1_symbol = GameStatus.objects.filter(player=opponent).first().symbol
            else:
                user = CustomUser.objects.get(uuid=uuid_user)
                game_status1_symbol = GameStatus.objects.filter(player=uuid_user).first().symbol
            if(game_status1_symbol == "X"):
                symbol = "O"
            else:
                symbol = "X"
            gamestatus_data = {
                "player": user.uuid,
                "result": "unknown",
                "symbol": symbol,
                "game": game_instance.uuid,  # Use instance instead of raw data
                "elo": user.elo
            }
            serializer_gamestatus = GameStatusSerializerCreate(data=gamestatus_data)
            if serializer_gamestatus.is_valid():
                serializer_gamestatus.save()
            else:
                game_instance.delete()
        else:
            user1 = CustomUser.objects.get(uuid=uuid_user)
            game_status1_symbol = GameStatus.objects.filter(player=uuid_user).first().symbol
            user2 = CustomUser.objects.get(uuid=opponent)
            if(game_status1_symbol == "X"):
                game_status2_symbol = "O"
            else:
                game_status2_symbol = "X"
            gamestatus_data1 = {
                "player": user1.uuid,
                "result": "unknown",
                "symbol": game_status2_symbol,
                "game": game_instance.uuid,  # Use instance instead of raw data
                "elo": user1.elo
            }
            gamestatus_data2 = {
                "player": user2.uuid,
                "result": "unknown",
                "symbol": game_status1_symbol,
                "game": game_instance.uuid,  # Use instance instead of raw data
                "elo": user2.elo
            }
            serializer_gamestatus = GameStatusSerializerCreate(data=gamestatus_data1)
            if serializer_gamestatus.is_valid():
                serializer_gamestatus.save()
            else:
                game_instance.delete()
            serializer_gamestatus = GameStatusSerializerCreate(data=gamestatus_data2)
            if serializer_gamestatus.is_valid():
                serializer_gamestatus.save()
            else:
                game_instance.delete()
        return str(game_instance.uuid)

    def save_win_board(self, game_uuid, win_probality):
        for i in range(len(win_probality)):
            for j in range(len(win_probality[0])):
                if(win_probality[i][j] == "Xw" or win_probality[i][j] == "Ow"):
                    board = Board.objects.filter(game=game_uuid, row=i, column=j).first()
                    board.symbol = win_probality[i][j]
                    board.save()

    def if_cell_exist(self, game_uuid, row, column):
        return Board.objects.filter(game=game_uuid, row=row, column=column).exists()
