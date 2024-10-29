from django.urls import path, include
from . import views

urlpatterns = [
    path("", views.hello),
    path("api", views.api),
]
