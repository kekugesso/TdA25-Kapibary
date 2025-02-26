import json
import random

import requests

with open("usernames.txt") as f:
    for _ in range(500):
        username = f.readline().strip()

        response = requests.request(
            "POST",
            "http://localhost:3000/api/v1/users",
            headers={
                'Content-Type': 'application/json'
            },
            data=json.dumps({
                "username": username,
                "password": "pass",
                "elo": random.randint(400, 2600)
            })
        )
        print(username, response.status_code,
              str(response.elapsed.total_seconds()) + "s")
