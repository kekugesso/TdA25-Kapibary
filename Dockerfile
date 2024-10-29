# syntax=docker/dockerfile:1

FROM python:3.10-alpine

WORKDIR /app

RUN pip install pipenv

COPY Pipfile .
COPY Pipfile.lock .

RUN pipenv install --system --deploy

COPY . .

RUN chmod +x start.sh

EXPOSE 80

ENTRYPOINT ["./start.sh"] 

CMD ["prod"]

