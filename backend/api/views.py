import uuid
import random
import string
import re

from datetime import timedelta
from django.utils import timezone
from django.forms.models import model_to_dict
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Game, Board, CustomUser, GameStatus, QueryUsers
from .serializers import GameSerializer, BoardSerializer, CustomUserSerializerView, CustomUserSerializerCreate, GameStatusSerializerCreate, GameSerializerMultiplayer, GameStatusForUserSerializerView, QueryUsersSerializerView, QueryUsersSerializerCreate, GameSerializerFreeplayView
from .filters import UserFilter


class CustomPagination(PageNumberPagination):
    page_size = 100 
    page_size_query_param = 'page_size'
    max_page_size = 500


class AllUsersView(APIView):
    """
    class for retrieving all users

    methods:
        get: retrieves all users
    """
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = UserFilter
    search_fields = ["username"]

    def get(self, request):
        """
        retrieves all users
        returns:
            200: JSON with all users
        """
        users = CustomUser.objects.filter(is_superuser=False)
        user_filter = UserFilter(request.GET, queryset=users)
        filtered_users = user_filter.qs
        paginator = self.pagination_class()
        paginated_users = paginator.paginate_queryset(filtered_users, request)
        

        serializer = CustomUserSerializerView(paginated_users, many=True)
        result = [count_results(user["uuid"], user) for user in serializer.data]

        return paginator.get_paginated_response(result)

    def post(self, request):
        """
        creates a new user
        returns:
            201: JSON with the created user
            400: JSON with bad data
        """
        data = request.data
        if(data["username"] == "TdA"):
            data["is_superuser"] = True
        else:
            data["is_superuser"] = False
        if(is_valid_password(data["password"]) == False):
            return Response({"message": "Heslo nesplňuje podminky"}, status=400)
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
        return Response(result, status=200)
    
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
        if(request.user.is_authenticated and request.user.is_superuser):
            data = request.data
            if(data.get("new_elo") is not None):
                user.elo = data["new_elo"]
            if(data.get("is_banned") is not None):
                user.is_banned = data["is_banned"]
            user.save()
            return Response(status=200)
        else:
            if(user.check_password(request.data["password"])):
                data = request.data
                if(data.get("new_password") is not None and data.get("new_password") != ""):
                    if(is_valid_password(data["new_password"])):
                        data["password"] = data["new_password"]
                    else:
                        return Response({"password": "Heslo nesplňuje podminky"}, status=400)
                serializer = CustomUserSerializerCreate(user, data=data)
                if not serializer.is_valid():
                    return Response(serializer.errors, status=400)
                user = serializer.save()
                serializer = CustomUserSerializerView(user)
                result = count_results(user.uuid, serializer.data)
                return Response(result)
            else:
                return Response({"password": "Spatné heslo."}, status=401)

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
                    updatedAt__gt=timezone.now() - timedelta(hours=24),
                    gameType = "local"
                )
            elif (data.get("updatedAt") == "7days"):
                games = Game.objects.filter(
                    difficulty=dif,
                    updatedAt__gt=timezone.now() - timedelta(days=7),
                    gameType = "local"
                )
            elif (data.get("updatedAt") == "1month"):
                games = Game.objects.filter(
                    difficulty=dif,
                    updatedAt__gt=timezone.now() - timedelta(days=30),
                    gameType = "local"
                )
            elif (data.get("updatedAt") == "3months"):
                games = Game.objects.filter(
                    difficulty=dif,
                    updatedAt__gt=timezone.now() - timedelta(days=90),
                    gameType = "local"
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
        if data.get('login') is None or data.get('password') is None:
            return Response({"message": "Missing login or password"}, status=400)
        if '@' in data['login']:
            user = CustomUser.objects.filter(email=data['login']).first()
        else:
            user = CustomUser.objects.filter(username=data['login']).first()
        if user is None:
            return Response(status=401)
        if not user.check_password(data['password']):
            return Response(status=401)
        token, created = Token.objects.get_or_create(user=user)
        serializer = CustomUserSerializerView(user)
        return Response({'token': token.key, "user": count_results(user.uuid, serializer.data)}, status=200)


class CheckToken(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = CustomUser.objects.get(uuid=request.user.uuid)
        serializer = CustomUserSerializerView(user)
        result = count_results(user.uuid, serializer.data)
        return Response(result, status=200)


class FreeplayGameView(APIView):
    def put(self, request):
        data = request.data
        game = Game.objects.filter(gameCode=data["code"]).last()
        if game is None:
            return Response({"message": "Game not found"}, status=404)
        if(request.user.is_authenticated == False):
            characters = string.ascii_lowercase + string.digits
            authtoken = ''.join(random.choices(characters, k=40))
            game.anonymousToken = authtoken
            game.save()
        if(request.user.is_authenticated == True):
            gamestatus = GameStatus.objects.filter(game=game.uuid).first()
            game_status_data = {
                "player": request.user.uuid,
                "result": "unknown",
                "game": game.uuid,
                "elo": request.user.elo
            }
            if(gamestatus.symbol == "X"):
                game_status_data["symbol"] = "O"
            else:
                game_status_data["symbol"] = "X"
            serializer_gamestatus = GameStatusSerializerCreate(data=game_status_data)
            if serializer_gamestatus.is_valid():
                serializer_gamestatus.save()
            else:
                return Response(serializer_gamestatus.errors, status=400)
        serializer = GameSerializerFreeplayView(game)
        result = serializer.data
        result["authtoken"] = game.anonymousToken
        return Response(result, status=200)
        
    def post(self, request):
        data = {
            "name": ''.join(random.choices(string.ascii_letters, k=10)),
            "gameType": "friendly",
            "gameCode": random.randint(100000, 999999),
        }

        serializer = GameSerializer(data=data)
        if serializer.is_valid():
            game_instance = serializer.save()  # Save and keep reference
        else:
            return Response(serializer.errors, status=400)

        user = CustomUser.objects.get(uuid=request.user.uuid)
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
        serialized_game = GameSerializerFreeplayView(game_instance)
        return Response(serialized_game.data, status=200)


class GamesHistoryView(APIView):
    def get(self, request, uuid):
        game_statuses = GameStatus.objects.filter(player=uuid)
        data = []
        for game_status in game_statuses:
            games = GameStatus.objects.filter(game=game_status.game)
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
        result = get_game_history(result, uuid)
        return Response(result, status=200)


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

def  get_game_history(data, uuid_player):
    result = []
    print(data)
    for game in data:
        hello = {}
        opponent = {}
        if game.get("player2") is None:
            hello["game"] = game["player1"]["game"]
            hello["elo"] = game["player1"]["elo"]
            hello["symbol"] = game["player1"]["symbol"]
            hello["createdAt"] = game["player1"]["createdAt"]
            hello["result"] = game["player1"]["result"]
            hello["elo_change"] = game["player1"]["elodifference"]
            opponent["username"] = "Anonymous"
            opponent["elo"] = 0
            hello["opponent"] = opponent
        else:
            if(game["player1"]["player"]["uuid"] == uuid_player):
                hello["game"] = game["player1"]["game"]
                hello["elo"] = game["player1"]["elo"]
                hello["symbol"] = game["player1"]["symbol"]
                hello["createdAt"] = game["player1"]["createdAt"]
                hello["result"] = game["player1"]["result"]
                hello["elo_change"] = game["player1"]["elodifference"]
                opponent["username"] = game["player2"]["player"]["username"]
                opponent["elo"] = game["player2"]["elo"]
                hello["opponent"] = opponent
            else:
                hello["game"] = game["player2"]["game"]
                hello["elo"] = game["player2"]["elo"]
                hello["symbol"] = game["player2"]["symbol"]
                hello["createdAt"] = game["player2"]["createdAt"]
                hello["result"] = game["player2"]["result"]
                hello["elo_change"] = game["player2"]["elodifference"]
                opponent["username"] = game["player1"]["player"]["username"]
                opponent["elo"] = game["player1"]["elo"]
                hello["opponent"] = opponent
        result.append(hello)
    return(result)

class QueryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        last_game_status = GameStatus.objects.filter(player=request.user.uuid).last()
        if(last_game_status is None or last_game_status.result!="unknown"):
            data = {"user": request.user.uuid}
            try:
                QueryUsers.objects.get(user=request.user.uuid)
                return Response({"message": "Již si zaznamenal"}, status=400)
            except QueryUsers.DoesNotExist:
                pass
            serializer = QueryUsersSerializerCreate(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(status=201)
            else:
                return Response(serializer.errors, status=400)
        else:
            return Response({"message": "Už máš rozehranou hru."}, status=400)
    def delete(self, request):
        query = QueryUsers.objects.filter(user=request.user)
        if query.exists():
            query.delete()
            return Response(status=204)
        else:
            return Response(status=404)


class RatingView(APIView):
    def get(self, request):
        game_status = GameStatus.objects.filter(player=request.user.uuid).last()
        if(game_status is None):
            return Response({"message": "None"}, status=404)
        if(game_status.result == "unknown"):
            game = Game.objects.get(uuid=game_status.game.uuid)
            data = GameSerializerMultiplayer(game).data
            matrix = [["" for _ in range(15)] for _ in range(15)]
            for symbol in data.get("board", []):
                matrix[symbol["row"]][symbol["column"]] = symbol["symbol"]
            data["board"] = matrix
            return Response(data, status=200)
        else:
            return Response({"message": "None"}, status=404)
    def post(self, request):
        list = QueryUsers.objects.all().order_by('-user__elo')
        result = []
        serializer = QueryUsersSerializerView(list, many=True)
        query_list = serializer.data
        if(len(query_list) >= 2):
            for i in range(0, len(query_list), 2):
                data = {
                    "name": ''.join(random.choices(string.ascii_letters, k=10)),
                    "gameType": "rating",
                }

                serializer = GameSerializer(data=data)
                if serializer.is_valid():
                    game_instance = serializer.save()  # Save and keep reference
                else:
                    return Response(serializer.errors, status=400)
                for j in range(2):
                    try:
                        data = query_list[i+j]["user"]["uuid"]
                        if(j == 0):
                            gamestatus_data = {
                                "player": query_list[i+j]["user"]["uuid"],
                                "result": "unknown",
                                "symbol": "X",
                                "game": game_instance.uuid,
                                "elo": query_list[i+j]["user"]["elo"]
                            }
                        elif (j==1):
                            gamestatus_data = {
                                "player": query_list[i+j]["user"]["uuid"],
                                "result": "unknown",
                                "symbol": "O",
                                "game": game_instance.uuid,
                                "elo": query_list[i+j]["user"]["elo"]
                            }
                        serializer = GameStatusSerializerCreate(data=gamestatus_data)
                        if serializer.is_valid():
                            serializer.save()
                        else:
                            game_instance.delete()
                            return Response(serializer.errors, status=400)
                        serialized_game = GameSerializerMultiplayer(game_instance)
                        data = serialized_game.data

                        matrix = [["" for _ in range(15)] for _ in range(15)]
                        for symbol in data.get("board", []):
                            matrix[symbol["row"]][symbol["column"]] = symbol["symbol"]
                        data["board"] = matrix
                        result.append(data)
                    except Exception as e:
                        game_instance.delete()
            last_query = None
            if(len(query_list) % 2 == 1):
                last_query = query_list[len(query_list)-1]["user"]["uuid"]
            for i in range(len(query_list)):
                queryuser = QueryUsers.objects.get(user=query_list[i]["user"]["uuid"])
                queryuser.delete()
            if last_query is not None:
                serializer = QueryUsersSerializerCreate(data={"user": last_query})
                if serializer.is_valid():
                    serializer.save()
        return Response(result, status=201)


class TopView(APIView):
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = UserFilter
    search_fields = ["username"]
    def get(self, request):
        """
        retrieves all users
        returns:
            200: JSON with all users
        """
        users = CustomUser.objects.filter(is_superuser=False, is_banned=False).order_by('-elo')
        user_filter = UserFilter(request.GET, queryset=users)
        filtered_users = user_filter.qs
        paginator = self.pagination_class()
        paginated_users = paginator.paginate_queryset(filtered_users, request)
        
        serializer = CustomUserSerializerView(paginated_users, many=True)
        result = [count_results(user["uuid"], user) for user in serializer.data]

        return paginator.get_paginated_response(result)

def is_valid_password(password):
    if len(password) < 8:
        return False  # Kontrola délky

    # Kontrola jednotlivých podmínek pomocí regulárních výrazů
    if not re.search(r'[A-Z]', password):  # alespoň jedno velké písmeno
        return False
    if not re.search(r'[a-z]', password):  # alespoň jedno malé písmeno
        return False
    if not re.search(r'\d', password):  # alespoň jedna číslice
        return False
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):  # alespoň jeden speciální znak
        return False

    return True


class SearchUserView(APIView):
    def post(self, request):
        data = request.data
        user = CustomUser.objects.filter(username=data["username"]).first()
        if user is None:
            return Response(None, status=200)
        
        serializer = CustomUserSerializerView(user)
        result = count_results(user.uuid, serializer.data)
        if(not user.is_banned and not user.is_superuser):
            users = CustomUser.objects.filter(is_superuser=False, is_banned=False).order_by('-elo')
            for i in range(len(users)):
                if users[i].username == data["username"]:
                    result["position"] = i+1
                    break
        return Response(result, status=200)