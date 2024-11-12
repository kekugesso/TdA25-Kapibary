from django.urls import path
from . import views

urlpatterns = [
    path("game", views.FrontForFun),
    path("api/v1/games", views.AllGamesView.as_view()),
    path("api/v1/games/<uuid1>", views.GameView.as_view()),
]
