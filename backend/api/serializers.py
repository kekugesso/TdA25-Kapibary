from rest_framework import serializers
from .models import Game, Board, CustomUser, GameStatus


class GameStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameStatus
        fields = '__all__'


class CustomUserSerializerCreate(serializers.ModelSerializer):
    """
    Serializer for the CustomUser model
    """
    class Meta:
        model = CustomUser
        fields = '__all__'


class CustomUserSerializerView(serializers.ModelSerializer):
    """
    Serializer for the CustomUser model
    """
    createdAt = serializers.DateTimeField(source='date_joined', read_only=True)

    class Meta:
        """Meta class for the CustomUserSerializer

        Args:
            serializers ([type]): [description]

        Returns:
            [type]: [description]
        """
        model = CustomUser
        fields = ['uuid', 'elo', 'createdAt', 'email', 'username']


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