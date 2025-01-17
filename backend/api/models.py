from django.db import models


class GameState(models.TextChoices):
    """Possible game states"""
    UNKNOWN = "unknown"
    OPENING = "opening"
    MIDGAME = "midgame"
    ENDGAME = "endgame"


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
    uuid = models.UUIDField(primary_key=True)
    name = models.TextField(null=False)
    createdAt = models.DateTimeField(null=False, auto_now_add=True)
    updatedAt = models.DateTimeField(null=False, auto_now=True)
    difficulty = models.CharField(choices=Difficulty.choices, max_length=20,
                                  default=Difficulty.BEGINNER, null=False)
    gameState = models.CharField(choices=GameState.choices, max_length=20,
                                 default=GameState.UNKNOWN, null=False)

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
    uuid = models.UUIDField(primary_key=True)
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
