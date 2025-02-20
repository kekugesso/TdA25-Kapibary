from django.urls import path
from . import views



urlpatterns = [
    path("api/v1/games", views.AllGamesView.as_view()),
    path("api/v1/games/<uuid1>", views.GameView.as_view()),
    path("api/v1/filter", views.FilterAPIView.as_view()),
    path("api/v1/users", views.AllUsersView.as_view()),
    path("api/v1/users/<uuid1>", views.UserView.as_view()),
    path('api/v1/login', views.Login.as_view()),
    path('api/v1/logout', views.Logout.as_view()),
    path('api/v1/check', views.CheckToken.as_view()),
    path('api/v1/friendly', views.FriedlyGameView.as_view()),
    path('api/v1/users/<uuid>/game_history', views.GamesHistoryView.as_view()),
]
