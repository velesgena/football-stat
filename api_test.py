#!/usr/bin/env python3
import requests
import json
import sys

# Целевые URL для тестирования
API_URL = "http://192.168.1.124:8088/teams/"

def test_api_request():
    """Выполняет тестовый запрос к API и выводит подробную информацию"""
    print(f"Выполняется GET запрос к {API_URL}")
    
    try:
        # Устанавливаем таймаут в 5 секунд
        response = requests.get(API_URL, timeout=5)
        
        # Вывод заголовков
        print("\n===== ЗАГОЛОВКИ ОТВЕТА =====")
        for key, value in response.headers.items():
            print(f"{key}: {value}")
        
        # Вывод статуса и кода
        print(f"\n===== СТАТУС: {response.status_code} {response.reason} =====")
        
        # Вывод содержимого ответа
        print("\n===== СОДЕРЖИМОЕ ОТВЕТА =====")
        
        # Попытка вывести ответ как JSON
        try:
            formatted_json = json.dumps(response.json(), ensure_ascii=False, indent=2)
            print(formatted_json)
        except:
            # Если не удалось преобразовать в JSON, выводим текст
            print(response.text[:1000])  # Ограничиваем вывод до 1000 символов
            if len(response.text) > 1000:
                print("... [обрезано]")
        
        return True
        
    except requests.exceptions.ConnectionError as e:
        print(f"\n⚠️ ОШИБКА СОЕДИНЕНИЯ: {e}")
        print("Возможные причины:")
        print("1. API-сервер не запущен")
        print("2. Неправильный IP или порт")
        print("3. Сетевые проблемы")
        return False
        
    except requests.exceptions.Timeout as e:
        print(f"\n⚠️ ТАЙМАУТ: {e}")
        print("API-сервер не ответил в течение 5 секунд")
        return False
        
    except Exception as e:
        print(f"\n⚠️ НЕОЖИДАННАЯ ОШИБКА: {type(e).__name__}: {e}")
        return False

if __name__ == "__main__":
    success = test_api_request()
    sys.exit(0 if success else 1) 