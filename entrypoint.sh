#!/bin/bash
set -e

# Ожидание готовности базы данных
echo "Ожидание базы данных..."
sleep 5

# Запуск миграций
echo "Запуск миграций базы данных..."
alembic upgrade head

# Запуск приложения
echo "Запуск приложения..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8088 