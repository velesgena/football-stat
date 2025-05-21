import requests
import json

# API URL
API_URL = "http://192.168.1.124:8088"

def list_all_cities():
    """Получает список всех городов через API сервис"""
    
    try:
        # Отправляем GET-запрос к API
        response = requests.get(f"{API_URL}/cities/")
        
        # Проверяем статус ответа
        if response.status_code == 200:
            cities = response.json()
            
            if not cities:
                print("No cities found in the database.")
                return
            
            print("\nList of cities in the database:")
            print("=" * 50)
            print(f"{'ID':^5} | {'Name':^20} | {'Country':^15} | {'Population':^10}")
            print("-" * 50)
            
            for city in cities:
                city_id = city['id']
                name = city['name']
                country = city['country']
                population = city['population']
                print(f"{city_id:^5} | {name:^20} | {country:^15} | {population if population else 'N/A':^10}")
                
        else:
            print(f"Error: API returned status code {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"API request error: {str(e)}")
    except Exception as e:
        print(f"Error occurred: {str(e)}")

if __name__ == "__main__":
    list_all_cities() 