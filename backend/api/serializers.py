from rest_framework import serializers
from .models import Game, Board

class BoardSerializer(serializers.ModelSerializer):

    class Meta:
        model = Board
        fields = '__all__'


class GameSerializer(serializers.ModelSerializer):
    board = BoardSerializer(many=True, read_only=True)

    class Meta:
        model = Game
        fields = '__all__'
