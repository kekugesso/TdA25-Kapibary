import requests
import time

url = "http://localhost:2568/api/v1/rating"
while True:
    response = requests.post(url)
    time.sleep(5)
