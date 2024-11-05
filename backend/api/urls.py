from django.urls import path
from . import views

urlpatterns = [
    path("games", views.AllGamesView.as_view()),
    path("games/<uuid>", views.GameView.as_view()),
]
