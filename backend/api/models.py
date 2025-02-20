import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    """Custom user model

    Attributes:
        uuid: User uuid
        elo: User elo

    methods:
        __repr__: returns user uuid
    """
    groups = models.ManyToManyField(
        "auth.Group",
        related_name="customuser_set",
        blank=True
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="customuser_permissions_set",
        blank=True
    )
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)
    elo = models.IntegerField(null=False)
    avatar = models.TextField(null=False)
    is_banned = models.BooleanField(default=False)

    def __repr__(self):
        """returns user uuid

        Returns:
            str: user uuid
        """
        return f"<User {self.uuid}>"


class GameState(models.TextChoices):
    """Possible game states"""
    UNKNOWN = "unknown"
    OPENING = "opening"
    MIDGAME = "midgame"
    ENDGAME = "endgame"


class GameResult(models.TextChoices):
    """Possible game results"""
    UNKNOWN = "unknown"
    WIN = "win"
    LOSE = "lose"
    DRAW = "draw"


class Difficulty(models.TextChoices):
    """Possible difficulties"""
    BEGINNER = "beginner"
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXTREME = "extreme"


class Symbol(models.TextChoices):
    """Possible symbols"""
    X = "X"
    O = "O"


class GameType(models.TextChoices):
    """Possible game types"""
    LOCAL = "local"
    FRIENDLY = "friendly"
    RATING = "rating"


class Game(models.Model):
    """Game model

    Attributes:
        uuid: Game uuid
        name: Game name
        createdAt: Game creation date
        updatedAt: Game last update date
        difficulty: Game difficulty
        gameState: Game state

    methods:
        __repr__: returns game uuid
    """
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)
    name = models.TextField(null=False)
    createdAt = models.DateTimeField(null=False, auto_now_add=True)
    updatedAt = models.DateTimeField(null=False, auto_now=True)
    difficulty = models.CharField(choices=Difficulty.choices, max_length=20,
                                  default=Difficulty.BEGINNER, null=False)
    gameState = models.CharField(choices=GameState.choices, max_length=20,
                                 default=GameState.UNKNOWN, null=False)
    gameType = models.CharField(choices=GameType.choices, max_length=20,
                                default=GameType.LOCAL, null=False)
    gameCode = models.TextField(null=True)
    anonymousToken = models.TextField(null=True)

    def __repr__(self):
        """returns game uuid

        Returns:
            str: game uuid
        """
        return f"<Game {self.uuid}>"


class Board(models.Model):
    """Board model

    Attributes:
        uuid: Board uuid
        row: Board row
        column: Board column
        symbol: Board symbol
        game: Game uuid

    methods:
        __repr__: returns board uuid
    """
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)
    row = models.IntegerField(null=False)
    column = models.IntegerField(null=False)
    symbol = models.CharField(choices=Symbol.choices, max_length=1, null=False)
    game = models.ForeignKey('Game',
                             on_delete=models.CASCADE,
                             related_name='board')

    def __repr__(self):
        """
        returns board uuid

        Returns:
            str: board uuid
        """
        return f"<Board {self.uuid}>"


class GameStatus(models.Model):
    """Multiplayer game model

    Attributes:
        uuid: Multiplayer game uuid
        game: Game uuid

    methods:
        __repr__: returns multiplayer game uuid
    """
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)
    game = models.ForeignKey('Game',
                             on_delete=models.CASCADE,
                             related_name='game_status')
    player = models.ForeignKey('CustomUser',
                               on_delete=models.CASCADE,
                               related_name='game_status')
    elo = models.IntegerField(null=False)
    result = models.CharField(choices=GameResult.choices, max_length=20,
                              default=GameResult.UNKNOWN, null=False)
    symbol = models.CharField(choices=Symbol.choices, max_length=1, null=False)
    createdAt = models.DateTimeField(null=False, auto_now_add=True)
    elodifference = models.IntegerField(null=True)

    def __repr__(self):
        """
        returns multiplayer game uuid

        Returns:
            str: multiplayer game uuid
        """
        return f"<GameStatus {self.uuid}>"
