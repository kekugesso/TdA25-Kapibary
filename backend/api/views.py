import uuid
import requests
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import HttpResponse, JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Game, Board
from .serializers import GameSerializer, BoardSerializer


class AllGamesView(APIView):
    def get(self, request):
        games = Game.objects.all()
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
        data = request.data
        countx = 0
        counto = 0
        board = data.pop('board')
        if len(board) != 15 or len(board[0]) != 15:
            return Response({"message": "Invalid board size"}, status=422)
        for i in range(len(board)):
            for j in range(len(board[i])):
                if board[i][j] != "":
                    if board[i][j] == "X":
                        countx += 1
                    elif board[i][j] == "O":
                        counto += 1
        if countx - counto < 0 or countx - counto > 1:
            return Response({"message": "Invalid number of X and O"}, status=422)
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
        for i in range(len(board)):
            for j in range(len(board[0])):
                if board[i][j] != "":
                    if board[i][j] == "X":
                        countx += 1
                    elif board[i][j] == "O":
                        counto += 1
                    data_board = {"uuid": str(uuid.uuid4()),"row": i, "column": j, "symbol": board[i][j], "game": data["uuid"]}
                    serializer_board = BoardSerializer(data=data_board)
                    if serializer_board.is_valid():
                        serializer_board.save()
                    else:
                        game = Game.objects.get(uuid=data["uuid"])
                        game.delete()
                        return Response({"message": "Invalid board content"}, status=422)
        data = serializer.data
        matrix = [["" for _ in range(15)] for _ in range(15)]
        for symbol in data.get("board"):
            matrix[symbol["row"]][symbol["column"]] = symbol["symbol"]
        data["board"] = matrix
        return Response(data, status=201)

class GameView(APIView):
    def get(self, request, uuid1):
        game = get_object_or_404(Game, uuid=uuid1)
        serializer = GameSerializer(game)
        data = serializer.data
        matrix = [["" for _ in range(15)] for _ in range(15)]
        for symbol in data.get("board"):
            matrix[symbol["row"]][symbol["column"]] = symbol["symbol"]
        data["board"] = matrix
        return Response(data)

    def delete(self, request, uuid1):
        game = get_object_or_404(Game, uuid=uuid1)
        game.delete()
        return Response(status=204)

    def put(self, request, uuid1):
        game = get_object_or_404(Game, uuid=uuid1)
        boards = Board.objects.all().filter(game=uuid1)
        data = request.data
        countx = 0
        counto = 0
        data["uuid"] = uuid1
        board_main = data.pop('board')
        cells = []
        if (len(board_main) != 15 or len(board_main[0]) != 15):
            return Response({"message": "Invalid board size"}, status=422)
        for i in range(len(board_main)):
            for j in range(len(board_main[0])):
                if board_main[i][j] != "":
                    if board_main[i][j] == "X":
                        countx += 1
                    elif board_main[i][j] == "O":
                        counto += 1
                    data_board = {"uuid": str(uuid.uuid4()),"row": i, "column": j, "symbol": board_main[i][j], "game": uuid1}
                    serializer_board = BoardSerializer(data=data_board)
                    if serializer_board.is_valid():
                        cells.append(data_board)
                    else:
                        return Response({"message": "Invalid board content"}, status=422)
        for board in boards:
            board.delete()
        for cell in cells:
            serializer_board = BoardSerializer(data=cell)
            if serializer_board.is_valid():
                serializer_board.save()
        if countx - counto < 0 or countx - counto > 1:
            return Response({"message": "Invalid number of X and O"}, status=422)
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
    def get(self, request):
        data = request.data
        result = []
        if (data.get("updatedAt") != "24hours" and data.get("updatedAt") != "7days" and data.get("updatedAt") != "1month" and data.get("updatedAt") != "3months"):
            return Response({"message": "Invalid updatedAt"}, status=422)
        for dif in data.get("difficulty"):
            if(dif != "beginner" and dif != "medium" and dif != "easy" and dif != "extreme" and dif != "hard"):
                return Response({"message": "Invalid difficulty"}, status=422)
            if (data.get("updatedAt") == "24hours"):
                games = Game.objects.filter(difficulty=dif, updatedAt__gt=timezone.now() - timedelta(hours=24))
            elif (data.get("updatedAt") == "7days"):
                games = Game.objects.filter(difficulty=dif, updatedAt__gt=timezone.now() - timedelta(days=7))
            elif (data.get("updatedAt") == "1month"):
                games = Game.objects.filter(difficulty=dif, updatedAt__gt=timezone.now() - timedelta(days=30))
            elif (data.get("updatedAt") == "3months"):
                games = Game.objects.filter(difficulty=dif, updatedAt__gt=timezone.now() - timedelta(days=90))
            serializer = GameSerializer(games, many=True)
            for game in serializer.data:
                matrix = [["" for _ in range(15)] for _ in range(15)]
                for symbol in game.get("board"):
                    matrix[symbol["row"]][symbol["column"]] = symbol["symbol"]
                game["board"] = matrix
                result.append(game)
        return Response(result)


def FrontForFun(request):
    return HttpResponse("Front for fun", content_type="text/html")


def SpecificFrontForFun(request, uuid1):
    return HttpResponse("Specific front for fun", content_type="text/html")

def can_win_next_move(board, symbol):
    size = 15
    for row in range(size):
        for col in range(size):
            if board[row][col] == "":
                continue

            if col <= size - 5:
                line = [board[row][col + i] for i in range(5)]
                if all(cell in {symbol, ""} for cell in line) and line.count(symbol) == 4:
                    return True

            if row <= size - 5:
                line = [board[row + i][col] for i in range(5)]
                if all(cell in {symbol, ""} for cell in line) and line.count(symbol) == 4:
                    return True

            if row <= size - 5 and col <= size - 5:
                line = [board[row + i][col + i] for i in range(5)]
                if all(cell in {symbol, ""} for cell in line) and line.count(symbol) == 4:
                    return True

            if row <= size - 5 and col >= 4:
                line = [board[row + i][col - i] for i in range(5)]
                if all(cell in {symbol, ""} for cell in line) and line.count(symbol) == 4:
                    return True

    return False
