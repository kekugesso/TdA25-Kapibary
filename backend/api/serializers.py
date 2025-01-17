from rest_framework import serializers
from .models import Game, Board


class BoardSerializer(serializers.ModelSerializer):
    """
    Serializer for the Board model
    """
    class Meta:
        """Meta class for the BoardSerializer

        Args:
            serializers ([type]): [description]

        Returns:
            [type]: [description]
        """
        model = Board
        fields = '__all__'


class GameSerializer(serializers.ModelSerializer):
    """
    Serializer for the Game model
    """
    board = BoardSerializer(many=True, read_only=True)

    class Meta:
        """Meta class for the GameSerializer

        Args:
            serializers ([type]): [description]

        Returns:
            [type]: [description]
        """
        model = Game
        fields = '__all__'