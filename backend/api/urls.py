from django.urls import path
from . import views

urlpatterns = [
    path("games", views.FrontForFun),
    path("api/games", views.AllGamesView.as_view()),
    path("api/games/<uuid1>", views.GameView.as_view()),
]
