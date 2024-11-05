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
    EMPTY = ""


class Game(models.Model):
    uuid = models.UUIDField(primary_key=True)
    name = models.TextField(null=False)
    createdAt = models.DateTimeField(null=False)
    updatedAt = models.DateTimeField(null=False)
    difficulty = models.CharField(choices=Dificulty.choices, max_length=20,
                                  default=Dificulty.BEGINNER, null=False)
    gameState = models.CharField(choices=GameState.choices, max_length=20,
                                  default=GameState.UNKNOWN, null=False)
    board = models.JSONField(null=False)

    def __repr__(self):
        return f"<Game {self.uuid}>"
