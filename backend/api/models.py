from django.db import models


class GameState(models.TextChoices):
    UNKNOWN = "unknown"
    OPENING = "opening"
    MIDGAME = "midgame"
    ENDGAME = "endgame"


class Dificulty(models.TextChoices):
    BEGINNER = "beginner"
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXTREME = "extreme"


class Symbol(models.TextChoices):
    X = "X"
    O = "O"


class Game(models.Model):
    uuid = models.UUIDField(primary_key=True)
    name = models.TextField(null=False)
    createdAt = models.DateTimeField(null=False, auto_now_add=True)
    updatedAt = models.DateTimeField(null=False, auto_now=True)
    difficulty = models.CharField(choices=Dificulty.choices, max_length=20,
                                  default=Dificulty.BEGINNER, null=False)
    gameState = models.CharField(choices=GameState.choices, max_length=20,
                                  default=GameState.UNKNOWN, null=False)

    def __repr__(self):
        return f"<Game {self.uuid}>"


class Board(models.Model):
    uuid = models.UUIDField(primary_key=True)
    row = models.IntegerField(null=False)
    column = models.IntegerField(null=False)
    symbol = models.CharField(choices=Symbol.choices, max_length=1, null=False)
    game = models.ForeignKey('Game', on_delete=models.CASCADE, related_name='board')

    def __repr__(self):
        return f"<Board {self.uuid}>"
