import requests
import time

url = "http://localhost:8000/api/v1/rating"
while True:
    response = requests.post(url)
    time.sleep(5)
