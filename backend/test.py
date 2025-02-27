import requests

url = "http://localhost:2568/api/v1/users"

data = {"username": "TdA",
        "password": "StudentCyberGames25!",
        "email": "tda@scg.cz",
        "elo": -1}

response = requests.post(url, json=data)