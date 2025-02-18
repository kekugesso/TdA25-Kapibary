import uuid
import random
import string
from datetime import timedelta
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Game, Board, CustomUser, GameStatus
from .serializers import GameSerializer, BoardSerializer, CustomUserSerializerView, CustomUserSerializerCreate, GameStatusSerializerCreate, GameSerializerMultiplayer

class AllUsersView(APIView):
    """
    class for retrieving all users

    methods:
        get: retrieves all users
    """
    def get(self, request):
        """
        retrieves all users
        returns:
            200: JSON with all users
        """
        users = CustomUser.objects.all()
        serializer = CustomUserSerializerView(users, many=True)
        data = serializer.data
        result = []
        for i in range(len(data)):
            result.append(count_results(data[i]["uuid"], data[i]))
        return Response(result, status=200)

    def post(self, request):
        """
        creates a new user
        returns:
            201: JSON with the created user
            400: JSON with bad data
        """
        data = request.data
        data["is_superuser"] = False
        serializer = CustomUserSerializerCreate(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        user = CustomUser.objects.create_user(**serializer.data)
        serializer = CustomUserSerializerView(user)
        result = count_results(user.uuid, serializer.data)
        token, created = Token.objects.get_or_create(user=user)
        resultwithtoken = {"token": token.key, "user": result}
        return Response(resultwithtoken, status=201)


class UserView(APIView):
    """
    class for retrieving one user

    methods:
        get: retrieves one user
    """
    def get(self, request, uuid1):
        """
        retrieves one user
        returns:
            200: JSON with the user
            404: JSON with user not found
        """
        try:
            user = CustomUser.objects.get(uuid=uuid1)
        except Exception as e:
            return Response({"message": "Neexistujicí uživatel."}, status=404)
        serializer = CustomUserSerializerView(user)
        result = count_results(user.uuid, serializer.data)
        return Response(result)
    def delete(self, request, uuid1):
        """
        deletes one user
        returns:
            204: no content
            404: JSON with user not found
        """
        try:
            user = CustomUser.objects.get(uuid=uuid1)
        except Exception as e:
            return Response({"message": "Neexistujicí uživatel."}, status=404)
        user.delete()
        return Response(status=204)

    def put(self, request, uuid1):
        """
        edits one user
        returns:
            200: JSON with the edited user
            400: JSON with bad data
            404: JSON with user not found
        """
        try:
            user = CustomUser.objects.get(uuid=uuid1)
        except Exception as e:
            return Response({"message": "Neexistujicí uživatel."}, status=404)
        serializer = CustomUserSerializerCreate(user, data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        user = serializer.save()
        serializer = CustomUserSerializerView(user)
        result = count_results(user.uuid, serializer.data)
        return Response(result)

class AllGamesView(APIView):
    """
    class for creating and retrieving all games

    methods:
        get: retrieves all games
        post: creates a new game
    """
    def get(self, request):
        """
        retrieves all games
        returns:
            200: JSON with all games
        """
        games = Game.objects.filter(gameType="local")
        serializer = GameSerializer(games, many=True)
        result = []
        for game in serializer.data:
            matrix = [["" for _ in range(15)] for _ in range(15)]
            for symbol in game.get("board"):
                matrix[symbol["row"]][symbol["column"]] = symbol["symbol"]
            game["board"] = matrix
            result.append(game)
        return Response(result)

    def post(self, request):
        """
        creates a new game
        returns:
            200: JSON with the created game
            422: JSON with bad board data
            400: JSON with bad data
        """
        data = request.data
        countx = 0
        counto = 0
        try:
            board = data.pop('board')
        except KeyError:
            return Response({"message": "Hrací plocha není poslaná."},
                            status=400)
        if len(board) != 15 or len(board[0]) != 15:
            return Response({"message": "Rozmer hrací plochy musí byt 15x15."},
                            status=422)
        for i in range(len(board)):
            for j in range(len(board[i])):
                if board[i][j] != "":
                    if board[i][j] == "X":
                        countx += 1
                    elif board[i][j] == "O":
                        counto += 1
        if countx - counto < 0 or countx - counto > 1:
            return Response({"message": "Špatný počet X a O."},
                            status=422)
        if counto >= 5:
            data["gameState"] = "midgame"
        else:
            data["gameState"] = "opening"
        if can_win_next_move(board, "X"):
            if (countx == counto):
                data["gameState"] = "endgame"
        elif can_win_next_move(board, "O"):
            if (countx - counto == 1):
                data["gameState"] = "endgame"
        data["uuid"] = str(uuid.uuid4())
        serializer = GameSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=400)
        datagame = GameSerializer(serializer.data).data
        for i in range(len(board)):
            for j in range(len(board[0])):
                if board[i][j] != "":
                    if board[i][j] == "X":
                        countx += 1
                    elif board[i][j] == "O":
                        counto += 1
                    data_board = {"row": i,
                                  "column": j,
                                  "symbol": board[i][j], "game": datagame["uuid"]}
                    serializer_board = BoardSerializer(data=data_board)
                    if serializer_board.is_valid():
                        serializer_board.save()
                    else:
                        game = Game.objects.get(uuid=datagame["uuid"])
                        game.delete()
                        return Response({"message": "Na hrací ploše mohou být jen X a O."},
                                        status=422)
        data = serializer.data
        matrix = [["" for _ in range(15)] for _ in range(15)]
        for symbol in data.get("board"):
            matrix[symbol["row"]][symbol["column"]] = symbol["symbol"]
        data["board"] = matrix
        return Response(data, status=201)


class GameView(APIView):
    """
    class for editing, deleting and retrieving one game

    methods:
        get: retrieves one game
        delete: deletes one game
        put: edits one game
    """
    def get(self, request, uuid1):
        """
        retrieves one game
        returns:
            200: JSON with the game
            404: JSON with game not found
        """
        try:
            game = Game.objects.get(uuid=uuid1)
        except Exception as e:
            return Response({"message": "Neexistujicí hra."}, status=404)
        serializer = GameSerializer(game)
        data = serializer.data
        matrix = [["" for _ in range(15)] for _ in range(15)]
        for symbol in data.get("board"):
            matrix[symbol["row"]][symbol["column"]] = symbol["symbol"]
        data["board"] = matrix
        return Response(data)

    def delete(self, request, uuid1):
        """
        deletes one game
        returns:
            204: no content
            404: JSON with game not found
        """
        try:
            game = Game.objects.get(uuid=uuid1)
        except Exception as e:
            return Response({"message": "Neexistujicí hra."}, status=404)
        game.delete()
        return Response(status=204)

    def put(self, request, uuid1):
        """
        edits one game
        returns:
            200: JSON with the edited game
            400: JSON with bad data
            404: JSON with game not found
            422: JSON with bad data
        """
        try:
            game = Game.objects.get(uuid=uuid1)
        except Exception as e:
            return Response({"message": "Neexistujicí hra."}, status=404)
        boards = Board.objects.all().filter(game=uuid1)
        data = request.data
        countx = 0
        counto = 0
        data["uuid"] = uuid1
        try:
            board_main = data.pop('board')
        except KeyError:
            return Response({"message": "Hrací plocha není poslaná."}, status=400)
        cells = []
        if (len(board_main) != 15 or len(board_main[0]) != 15):
            return Response({"message": "Rozmer hrací plochy musí byt 15x15."},
                            status=422)
        for i in range(len(board_main)):
            for j in range(len(board_main[0])):
                if board_main[i][j] != "":
                    if board_main[i][j] == "X":
                        countx += 1
                    elif board_main[i][j] == "O":
                        counto += 1
                    data_board = {"row": i,
                                  "column": j,
                                  "symbol": board_main[i][j],
                                  "game": uuid1}
                    serializer_board = BoardSerializer(data=data_board)
                    if serializer_board.is_valid():
                        cells.append(data_board)
                    else:
                        return Response({"message": "Na hrací ploše mohou být jen X a O."},
                                        status=422)
        if countx - counto < 0 or countx - counto > 1:
            return Response({"message": "Špatný počet X a O."}, status=422)
        for board in boards:
            board.delete()
        for cell in cells:
            serializer_board = BoardSerializer(data=cell)
            if serializer_board.is_valid():
                serializer_board.save()
        if counto >= 5:
            data["gameState"] = "midgame"
        else:
            data["gameState"] = "opening"
        if can_win_next_move(board_main, "X"):
            if (countx == counto):
                data["gameState"] = "endgame"
        elif can_win_next_move(board_main, "O"):
            if (countx - counto == 1):
                data["gameState"] = "endgame"
        serializer = GameSerializer(game, data=data)
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=400)
        matrix = [["" for _ in range(15)] for _ in range(15)]
        result = serializer.data
        for symbol in serializer.data.get("board"):
            matrix[symbol["row"]][symbol["column"]] = symbol["symbol"]
        result["board"] = matrix
        return Response(result, status=200)


class FilterAPIView(APIView):
    """
    class for filtering games

    methods:
        post: filters games
    """
    def post(self, request):
        """
        filters games
        returns:
            200: JSON with filtered games
            422: JSON with bad data
        """
        data = request.data
        result = []
        if (data.get("updatedAt") != "24hours"
            and data.get("updatedAt") != "7days"
            and data.get("updatedAt") != "1month"
           and data.get("updatedAt") != "3months"):
            return Response({"message": "Invalid updatedAt"}, status=422)
        for dif in data.get("difficulty"):
            if (dif != "beginner"
                and dif != "medium"
                and dif != "easy"
                and dif != "extreme"
               and dif != "hard"):
                return Response({"message": "Invalid difficulty"}, status=422)
            if (data.get("updatedAt") == "24hours"):
                games = Game.objects.filter(
                    difficulty=dif,
                    updatedAt__gt=timezone.now() - timedelta(hours=24)
                )
            elif (data.get("updatedAt") == "7days"):
                games = Game.objects.filter(
                    difficulty=dif,
                    updatedAt__gt=timezone.now() - timedelta(days=7)
                )
            elif (data.get("updatedAt") == "1month"):
                games = Game.objects.filter(
                    difficulty=dif,
                    updatedAt__gt=timezone.now() - timedelta(days=30)
                )
            elif (data.get("updatedAt") == "3months"):
                games = Game.objects.filter(
                    difficulty=dif,
                    updatedAt__gt=timezone.now() - timedelta(days=90)
                )
            serializer = GameSerializer(games, many=True)
            for game in serializer.data:
                matrix = [["" for _ in range(15)] for _ in range(15)]
                for symbol in game.get("board"):
                    matrix[symbol["row"]][symbol["column"]] = symbol["symbol"]
                game["board"] = matrix
                result.append(game)
        return Response(result)


def can_win_next_move(board, symbol):
    """
    checks if the next move can win the game
    returns:
        True if the next move can win the game
        False otherwise
    """
    size = 15
    for row in range(size):
        for col in range(size):
            if board[row][col] == "":
                continue

            if col <= size - 5:
                line = [board[row][col + i] for i in range(5)]
                if (all(cell in {symbol, ""} for cell in line)
                   and line.count(symbol) == 4):
                    return True

            if row <= size - 5:
                line = [board[row + i][col] for i in range(5)]
                if (all(cell in {symbol, ""} for cell in line)
                   and line.count(symbol) == 4):
                    return True

            if row <= size - 5 and col <= size - 5:
                line = [board[row + i][col + i] for i in range(5)]
                if (all(cell in {symbol, ""} for cell in line)
                   and line.count(symbol) == 4):
                    return True

            if row <= size - 5 and col >= 4:
                line = [board[row + i][col - i] for i in range(5)]
                if (all(cell in {symbol, ""} for cell in line)
                   and line.count(symbol) == 4):
                    return True

    return False


class Logout(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=200)


class Login(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        if '@' in data['login']:
            user = CustomUser.objects.get(email=data['login'])
        else:
            user = CustomUser.objects.get(username=data['login'])
        if not user.check_password(data['password']):
            return Response(status=401)
        token, created = Token.objects.get_or_create(user=user)
        serializer = CustomUserSerializerView(user)
        return Response({'token': token.key, "user": serializer.data}, status=200)


class CheckToken(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = CustomUser.objects.get(uuid=request.user.uuid)
        serializer = CustomUserSerializerView(user)
        result = count_results(user.uuid, serializer.data)
        return Response(result, status=200)


class FriedlyGameView(APIView):
    def post(self, request):
        data = {
            "name": ''.join(random.choices(string.ascii_letters, k=10)),
            "gameType": "friendly",
        }

        serializer = GameSerializer(data=data)
        if serializer.is_valid():
            game_instance = serializer.save()  # Save and keep reference
        else:
            return Response(serializer.errors, status=400)

        user = CustomUser.objects.get(uuid=request.data["uuid"])
        gamestatus_data = {
            "player": user.uuid,
            "result": "unknown",
            "symbol": request.data["symbol"],
            "game": game_instance.uuid,  # Use instance instead of raw data
            "elo": user.elo
        }

        serializer_gamestatus = GameStatusSerializerCreate(data=gamestatus_data)
        if serializer_gamestatus.is_valid():
            serializer_gamestatus.save()
        else:
            game_instance.delete()
            return Response(serializer_gamestatus.errors, status=400)

        # Retrieve the saved object correctly
        serialized_game = GameSerializerMultiplayer(game_instance)
        data = serialized_game.data

        # Process board data
        matrix = [["" for _ in range(15)] for _ in range(15)]
        for symbol in data.get("board", []):
            matrix[symbol["row"]][symbol["column"]] = symbol["symbol"]
        data["board"] = matrix

        return Response(data, status=200)

    def put(self, request):
        uuid_game = request.data["game"]
        uuid_user = request.data["user"]
        data = request.data
        game = Game.objects.get(uuid=uuid_game)
        user = CustomUser.objects.get(uuid=uuid_user)
        gamestatus_data = {
            "player": user.uuid,
            "result": "unknown",
            "symbol": request.data["symbol"],
            "game": game.uuid,  # Use instance instead of raw data
            "elo": user.elo
        }
        serializer_gamestatus = GameStatusSerializerCreate(data=gamestatus_data)
        if serializer_gamestatus.is_valid():
            serializer_gamestatus.save()
        else:
            return Response(serializer_gamestatus.errors, status=400)
        serialized_game = GameSerializerMultiplayer(game)
        data = serialized_game.data

        # Process board data
        matrix = [["" for _ in range(15)] for _ in range(15)]
        for symbol in data.get("board", []):
            matrix[symbol["row"]][symbol["column"]] = symbol["symbol"]
        data["board"] = matrix

        return Response(data, status=200)


def count_results(uuid, data):
    result = data
    games = GameStatus.objects.filter(player_id=uuid)
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
    result["wins"] = count_win
    result["losses"] = count_lose
    result["draws"] = count_draw
    return result
