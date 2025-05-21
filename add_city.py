import sys
import os
import requests
import json

# API URL
API_URL = "http://192.168.1.124:8088/cities/"

def add_city(name, country, population=None):
    """Добавляет город через API сервис вместо прямого доступа к БД"""
    
    # Создаем данные для запроса
    city_data = {
        "name": name,
        "country": country,
        "population": population
    }
    
    try:
        # Отправляем POST-запрос к API
        response = requests.post(API_URL, json=city_data)
        
        # Проверяем статус ответа
        if response.status_code in (200, 201):
            city = response.json()
            print(f"City added successfully! ID: {city['id']}")
            print(f"Name: {city['name']}")
            print(f"Country: {city['country']}")
            print(f"Population: {city['population']}")
            return city
        else:
            print(f"Error: API returned status code {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"API request error: {str(e)}")
        return None
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python add_city.py <name> <country> [population]")
        sys.exit(1)
    
    name = sys.argv[1]
    country = sys.argv[2]
    population = int(sys.argv[3]) if len(sys.argv) > 3 else None
    
    print("API_URL:", API_URL)
    print("DATABASE_URL:", os.getenv("DATABASE_URL"))
    
    add_city(name, country, population) 