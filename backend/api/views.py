import uuid
from datetime import datetime
from django.shortcuts import get_object_or_404
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
        data["uuid"] = str(uuid.uuid4())
        data["gameState"] = "unknown"
        board = data.pop('board')
        serializer = GameSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=400)
        if (len(board) != 15 or len(board[0]) != 15):
            game = Game.objects.get(uuid=data["uuid"])
            game.delete()
            return Response({"message": "Invalid board size"}, status=422)
        for i in range(len(board)):
            for j in range(len(board[0])):
                if board[i][j] != "":
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
        data["uuid"] = uuid1
        board = data.pop('board')
        cells = []
        if (len(board) != 15 or len(board[0]) != 15):
            return Response({"message": "Invalid board size"}, status=422)
        for i in range(len(board)):
            for j in range(len(board[0])):
                if board[i][j] != "":
                    data_board = {"uuid": str(uuid.uuid4()),"row": i, "column": j, "symbol": board[i][j], "game": uuid1}
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


def FrontForFun(request):
    return HttpResponse("Front for fun", content_type="text/html")


def SpecificFrontForFun(request):
    return HttpResponse("Specific front for fun", content_type="text/html")
