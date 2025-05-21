#!/usr/bin/env python3
import sys
import os
import requests
import traceback
import json

# Проверка соединения с базой данных
def test_database_connection():
    try:
        # Импортируем только необходимые модули
        from sqlalchemy import create_engine
        from sqlalchemy.exc import SQLAlchemyError
        
        # Получаем строку подключения из переменной окружения или используем PostgreSQL
        DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:pam@192.168.1.124:5432/football")
        
        print(f"Тестирование соединения с БД: {DATABASE_URL}")
        
        # Пробуем соединиться
        engine = create_engine(DATABASE_URL)
        connection = engine.connect()
        connection.close()
        
        print("✅ Соединение с базой данных успешно")
        return True
    except ImportError:
        print("❌ Ошибка: не установлены необходимые пакеты (sqlalchemy)")
        return False
    except SQLAlchemyError as e:
        print(f"❌ Ошибка подключения к БД: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Неизвестная ошибка при подключении к БД: {str(e)}")
        traceback.print_exc()
        return False

# Тестирование API
def test_api_endpoint(endpoint, method="GET", data=None):
    try:
        base_url = "http://192.168.1.124:8088"  # Или используйте другой базовый URL
        url = f"{base_url}{endpoint}"
        
        print(f"Тестирование API: {method} {url}")
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST" and data:
            response = requests.post(url, headers=headers, json=data, timeout=10)
        else:
            print(f"❌ Неподдерживаемый метод: {method}")
            return False
        
        print(f"Статус ответа: {response.status_code}")
        
        if 200 <= response.status_code < 300:
            print("✅ Успешный запрос")
            try:
                print(f"Данные ответа: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            except:
                print(f"Тело ответа: {response.text}")
            return True
        else:
            print(f"❌ Ошибка API: {response.status_code}")
            print(f"Текст ошибки: {response.text}")
            return False
    except requests.RequestException as e:
        print(f"❌ Ошибка запроса: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Неизвестная ошибка: {str(e)}")
        traceback.print_exc()
        return False

def main():
    print("=== Диагностика Football Stat API ===")
    
    # Проверяем соединение с БД
    db_status = test_database_connection()
    
    # Проверяем базовые эндпоинты
    print("\n--- Тестирование API эндпоинтов ---")
    root_status = test_api_endpoint("/")
    cities_status = test_api_endpoint("/cities/")
    
    # Проверяем создание города (возможная причина ошибки)
    test_city = {
        "name": "Test City",
        "country": "Test Country",
        "population": 100000
    }
    create_city_status = test_api_endpoint("/cities/", method="POST", data=test_city)
    
    # Выводим итоговый статус
    print("\n=== Результаты диагностики ===")
    print(f"База данных: {'✅ OK' if db_status else '❌ ОШИБКА'}")
    print(f"Корневой эндпоинт (/): {'✅ OK' if root_status else '❌ ОШИБКА'}")
    print(f"Эндпоинт городов (/cities/): {'✅ OK' if cities_status else '❌ ОШИБКА'}")
    print(f"Создание города: {'✅ OK' if create_city_status else '❌ ОШИБКА'}")
    
    if not db_status:
        print("\n⚠️ Рекомендация: Проверьте настройки подключения к базе данных в файле database.py")
    
    if not root_status and not cities_status:
        print("\n⚠️ Рекомендация: Проверьте, запущен ли API-сервер и доступен ли он по URL http://192.168.1.124:8088")
    
    if db_status and root_status and not cities_status:
        print("\n⚠️ Рекомендация: Возможно, проблема с обработкой запросов к /cities/. Проверьте логи API-сервера.")

if __name__ == "__main__":
    main() 