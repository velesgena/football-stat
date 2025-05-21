import sys
import requests
import json

# API URL
API_URL = "http://192.168.1.124:8088"

def get_city(city_id):
    """Получает информацию о городе по ID через API сервис"""
    
    try:
        # Отправляем GET-запрос к API
        response = requests.get(f"{API_URL}/cities/{city_id}/")
        
        # Проверяем статус ответа
        if response.status_code == 200:
            city = response.json()
            print("\nCity information:")
            print("=" * 40)
            print(f"ID: {city['id']}")
            print(f"Name: {city['name']}")
            print(f"Country: {city['country']}")
            print(f"Population: {city['population'] if city['population'] else 'N/A'}")
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
    if len(sys.argv) < 2:
        print("Usage: python get_city.py <city_id>")
        sys.exit(1)
    
    try:
        city_id = int(sys.argv[1])
    except ValueError:
        print("Error: city_id must be an integer")
        sys.exit(1)
    
    get_city(city_id) 