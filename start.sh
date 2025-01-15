#!/bin/sh

# run
if [ "$1" = "prod" ]; then
  source /opt/venv/bin/activate

  # api
  python3 backend/manage.py runserver 0.0.0.0:2568 &

  # frontend
  cd frontend
  npm run start

elif [ "$1" = "dev" ]; then
  source .venv/bin/activate
  python3 backend/manage.py runserver 127.0.0.1:2568 &

  cd frontend
  npm run dev

  pkill -f "python3 backend/manage.py runserver"
elif [ "$1" = "setup-dev" ]; then
  python3 -m venv .venv
  source .venv/bin/activate

  # install requirements
  pip install -r requirements.txt

  # create db
  touch backend/db.sqlite3
  python3 backend/manage.py makemigrations
  python3 backend/manage.py migrate

  cd frontend
  npm install
else
  echo "No such environment"
fi
