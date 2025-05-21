import sys
import requests
import json

# API URL
API_URL = "http://192.168.1.124:8088"

def update_city(city_id, name=None, country=None, population=None):
    """Обновляет информацию о городе через API сервис"""
    
    # Создаем данные для запроса (только если они предоставлены)
    city_data = {}
    if name is not None:
        city_data["name"] = name
    if country is not None:
        city_data["country"] = country
    if population is not None:
        city_data["population"] = population
    
    # Если нет данных для обновления, выходим
    if not city_data:
        print("No data provided for update")
        return None
    
    try:
        # Отправляем PUT-запрос к API
        response = requests.put(f"{API_URL}/cities/{city_id}/", json=city_data)
        
        # Проверяем статус ответа
        if response.status_code == 200:
            city = response.json()
            print(f"City updated successfully!")
            print(f"ID: {city['id']}")
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
        print("Usage: python update_city.py <city_id> [--name NAME] [--country COUNTRY] [--population POPULATION]")
        sys.exit(1)
    
    try:
        city_id = int(sys.argv[1])
    except ValueError:
        print("Error: city_id must be an integer")
        sys.exit(1)
    
    # Разбор аргументов командной строки
    name = None
    country = None
    population = None
    
    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == "--name" and i + 1 < len(sys.argv):
            name = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--country" and i + 1 < len(sys.argv):
            country = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--population" and i + 1 < len(sys.argv):
            try:
                population = int(sys.argv[i + 1])
            except ValueError:
                print("Error: population must be an integer")
                sys.exit(1)
            i += 2
        else:
            print(f"Unknown argument: {sys.argv[i]}")
            i += 1
    
    update_city(city_id, name, country, population) 