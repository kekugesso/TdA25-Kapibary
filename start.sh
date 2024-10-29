#!/bin/sh

# install requirements
pip install -r requirements.txt

# run
if [ "$1" = "prod" ]; then
  python3 backend/manage.py runserver 0.0.0.0:80
else
  echo "No such environment"
fi
