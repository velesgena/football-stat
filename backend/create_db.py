#!/usr/bin/env python
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Фиксированные параметры подключения
HOST = "192.168.1.124"
PORT = 5432
USER = "admin"
PASSWORD = "pam"
DB_NAME = "football"

def create_database():
    """Создание базы данных на сервере PostgreSQL"""
    try:
        # Подключение к PostgreSQL серверу
        print(f"Подключение к серверу PostgreSQL: {HOST}:{PORT} как пользователь {USER}")
        conn = psycopg2.connect(
            host=HOST,
            user=USER,
            password=PASSWORD,
            port=PORT,
            dbname="postgres"  # Подключаемся к базе данных postgres, которая существует по умолчанию
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Проверка существования базы данных
        cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{DB_NAME}'")
        exists = cursor.fetchone()
        
        if not exists:
            print(f"Создание базы данных '{DB_NAME}'...")
            cursor.execute(f"CREATE DATABASE {DB_NAME}")
            print(f"База данных '{DB_NAME}' успешно создана!")
        else:
            print(f"База данных '{DB_NAME}' уже существует.")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Ошибка при создании базы данных: {e}")
        return False

if __name__ == "__main__":
    success = create_database()
    if not success:
        sys.exit(1)
    else:
        print("Процесс создания базы данных завершен успешно!")
        print("Теперь вы можете применить миграции с помощью команды:")
        print("python migrator.py migrate --auto -m \"Начальная миграция\"") 