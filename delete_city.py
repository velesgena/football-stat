import sys
import requests

# API URL
API_URL = "http://192.168.1.124:8088"

def delete_city(city_id):
    """Удаляет город по ID через API сервис"""
    
    try:
        # Отправляем DELETE-запрос к API
        response = requests.delete(f"{API_URL}/cities/{city_id}")
        
        # Проверяем статус ответа
        if response.status_code == 204:
            print(f"City with ID {city_id} successfully deleted!")
            return True
        else:
            print(f"Error: API returned status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"API request error: {str(e)}")
        return False
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python delete_city.py <city_id>")
        sys.exit(1)
    
    try:
        city_id = int(sys.argv[1])
    except ValueError:
        print("Error: city_id must be an integer")
        sys.exit(1)
    
    delete_city(city_id) 