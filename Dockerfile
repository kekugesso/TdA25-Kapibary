FROM python:3.10-alpine AS backend

WORKDIR /app

COPY requirements.txt /app/

# install dep
RUN python3 -m venv /opt/venv && \
    . /opt/venv/bin/activate && \
    python3 -m pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy server
COPY backend /app/backend

# init db
RUN touch /app/backend/db.sqlite3 && \
    . /opt/venv/bin/activate && \
    python3 /app/backend/manage.py makemigrations && \
    python3 /app/backend/manage.py migrate


# --- Frontend Stage ---
FROM node:18-alpine AS frontend

WORKDIR /app

# Copy front
COPY frontend /app

# install dep and build
RUN npm install -f && npm run build


# --- Final Stage ---
FROM python:3.10-alpine AS final

WORKDIR /app

# install front server
RUN apk add nodejs npm

# Copy back
COPY --from=backend /app /app
COPY --from=backend /opt/venv /opt/venv

# Copy front
COPY --from=frontend /app/.next /app/frontend/.next
COPY --from=frontend /app/public /app/frontend/public
COPY --from=frontend /app/package.json /app/frontend/package.json
COPY --from=frontend /app/package-lock.json /app/frontend/package-lock.json
COPY --from=frontend /app/node_modules /app/frontend/node_modules

# Copy start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose ports
EXPOSE 2568
EXPOSE 80

CMD ["/app/start.sh", "prod"]

