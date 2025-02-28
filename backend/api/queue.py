import os
import time

import requests


def queue_process():
    print("Queue process started", os.getpid())
    time.sleep(5)
    requests.post(
        "http://localhost:2568/api/v1/users",
        json={
            "username": "TdA",
            "password": "StudentCyberGames25!",
            "email": "tda@scg.cz",
            "elo": -1,
        }
    )
    while True:
        requests.post("http://localhost:2568/api/v1/rating")
        time.sleep(5)
