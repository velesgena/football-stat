#!/usr/bin/env python
import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Параметры подключения к локальному PostgreSQL серверу
HOST = "localhost"  # Используем localhost вместо IP-адреса
PORT = 5432
USER = "postgres"  # Стандартное имя пользователя
PASSWORD = ""  # Предполагаем, что пароль для локального пользователя не установлен, при необходимости изменить
DB_NAME = "football_stats"

# Функция запроса пароля, если пароль не предоставлен
def get_password():
    import getpass
    if not PASSWORD:
        return getpass.getpass(f"Введите пароль для пользователя {USER}: ")
    return PASSWORD

def create_database():
    """Создание базы данных на сервере PostgreSQL"""
    try:
        # Получаем пароль, если не предоставлен
        pwd = get_password()
        
        # Подключение к PostgreSQL серверу
        print(f"Подключение к серверу PostgreSQL: {HOST}:{PORT} как пользователь {USER}")
        conn = psycopg2.connect(
            host=HOST,
            user=USER,
            password=pwd,
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
        return pwd  # Возвращаем пароль для использования в следующей функции
    except Exception as e:
        print(f"Ошибка при создании базы данных: {e}")
        return None

def create_tables(password):
    """Создание таблиц в базе данных"""
    try:
        # Подключение к базе данных
        print(f"Подключение к базе данных {DB_NAME}")
        conn = psycopg2.connect(
            host=HOST,
            user=USER,
            password=password,
            port=PORT,
            dbname=DB_NAME
        )
        
        # Чтение SQL скрипта
        with open('create_tables.sql', 'r') as sql_file:
            sql_script = sql_file.read()
        
        # Выполнение SQL скрипта
        print("Выполнение SQL скрипта для создания таблиц...")
        cursor = conn.cursor()
        cursor.execute(sql_script)
        conn.commit()
        
        print("Таблицы успешно созданы!")
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Ошибка при создании таблиц: {e}")
        return False

if __name__ == "__main__":
    # Создание базы данных
    password = create_database()
    if not password:
        print("Ошибка при создании базы данных. Завершение работы.")
        sys.exit(1)
    
    # Создание таблиц
    tables_success = create_tables(password)
    if not tables_success:
        print("Ошибка при создании таблиц. Завершение работы.")
        sys.exit(1)
    
    print("\nПроцесс настройки базы данных завершен успешно!")
    print("Теперь вы можете запустить миграции или приложение.") 