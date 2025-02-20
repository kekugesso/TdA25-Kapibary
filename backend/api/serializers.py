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
        fields = ['uuid', 'elo', 'createdAt', 'email', 'username', 'is_superuser', 'avatar', 'is_banned']


class CustomUserSerializerViewGameStatus(serializers.ModelSerializer):

    class Meta:
        """Meta class for the CustomUserSerializer

        Args:
            serializers ([type]): [description]

        Returns:
            [type]: [description]
        """
        model = CustomUser
        fields = ['uuid', 'username', 'avatar']


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


class GameStatusSerializerCreate(serializers.ModelSerializer):
    class Meta:
        model = GameStatus
        fields = '__all__'


class GameStatusSerializerView(serializers.ModelSerializer):
    player = CustomUserSerializerViewGameStatus(read_only=True)
    class Meta:
        model = GameStatus
        fields = ['player', 'elo', 'result', 'symbol', 'createdAt', 'elodifference']

class GameStatusForUserSerializerView(serializers.ModelSerializer):
    player = CustomUserSerializerViewGameStatus(read_only=True)
    class Meta:
        model = GameStatus
        fields = ['player', 'elo', 'result', 'symbol', 'createdAt', 'elodifference']

class GameSerializerMultiplayer(serializers.ModelSerializer):
    """
    Serializer for the Game model
    """
    board = BoardSerializer(many=True, read_only=True)
    game_status = GameStatusSerializerView(many=True)
    class Meta:
        """Meta class for the GameSerializer

        Args:
            serializers ([type]): [description]

        Returns:
            [type]: [description]
        """
        model = Game
        fields = ['board', 'uuid', 'gameType', 'game_status']


class GameHistorySerializer(serializers.Serializer):
    opponent = CustomUserSerializerViewGameStatus(read_only=True)
    #game_uuid = serializers.CharField(source='uuid', read_only=True)
    symbol = serializers.CharField(read_only=True)
    elo = serializers.IntegerField(read_only=True)
    result = serializers.CharField(read_only=True)
    elodifference = serializers.IntegerField(read_only=True)
    createdAt = serializers.DateTimeField(read_only=True)
