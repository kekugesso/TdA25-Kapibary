#!/bin/sh

# install requirements
pip install -r requirements.txt

# run
if [ "$1" = "prod" ]; then
  # api
  python3 backend/manage.py makemigrations
  python3 backend/manage.py migrate
  python3 backend/manage.py runserver 0.0.0.0:2568
else
  echo "No such environment"
fi
