import uuid
from datetime import datetime
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Game
from .serializers import GameSerializer


class AllGamesView(APIView):
    def get(self, request):
        games = Game.objects.all()
        serializer = GameSerializer(games, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        board = data.get('board')
        if (len(board) != 15):
            return Response({"message": "Invalid board size"}, status=422)
        else:
            for line in board:
                if (len(line) != 15):
                    return Response({"message": "Invalid board size"}, status=422)
                else:
                    for cell in line:
                        if (cell != "" and cell != "X" and cell != "O"):
                            return Response({"message": "Invalid board content"}, status=422)
        data['uuid'] = str(uuid.uuid4())
        data['createdAt'] = datetime.now()
        data['updatedAt'] = datetime.now()
        serializer = GameSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        for field, errors in serializer.errors.items():
            for error in errors:
                if (error.code == "invalid_choice"):
                    return Response(serializer.errors, status=422)
                else:
                    return Response(serializer.errors, status=400)


class GameView(APIView):
    def get(self, request, uuid):
        game = get_object_or_404(Game, uuid=uuid)
        serializer = GameSerializer(game)
        return Response(serializer.data)

    def delete(self, request, uuid):
        game = get_object_or_404(Game, uuid=uuid)
        game.delete()
        return Response(status=204)

    def put(self, request, uuid):
        game = get_object_or_404(Game, uuid=uuid)
        data = request.data
        board = data.get('board')
        if (len(board) != 15):
            return Response({"message": "Invalid board size"}, status=422)
        else:
            for line in board:
                if (len(line) != 15):
                    return Response({"message": "Invalid board size"}, status=422)
                else:
                    for cell in line:
                        if (cell != "" and cell != "X" and cell != "O"):
                            return Response({"message": "Invalid board content"}, status=422)
        data['updatedAt'] = datetime.now()
        serializer = GameSerializer(game, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        for field, errors in serializer.errors.items():
            for error in errors:
                if (error.code == "invalid_choice"):
                    return Response(serializer.errors, status=422)
                else:
                    return Response(serializer.errors, status=400)
