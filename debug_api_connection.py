#!/usr/bin/env python3
import socket
import requests
import json
import sys
import time
import subprocess
from urllib.parse import urlparse

# Параметры диагностики
API_HOST = "192.168.1.124"
API_PORT = 8088
DB_PORT = 5433
TEST_ENDPOINTS = [
    "/",
    "/teams/",
    "/cities/",
    "/db-test"
]

def check_port(host, port, timeout=2):
    """Проверяет, открыт ли порт на удаленном хосте"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        s.connect((host, port))
        s.close()
        return True
    except Exception as e:
        return False

def trace_route(host):
    """Выполняет трассировку маршрута к хосту"""
    try:
        if sys.platform == "win32":
            proc = subprocess.Popen(["tracert", host], stdout=subprocess.PIPE, text=True)
        else:
            proc = subprocess.Popen(["traceroute", "-n", host], stdout=subprocess.PIPE, text=True)
        
        result = proc.communicate()[0]
        return result
    except Exception as e:
        return f"Ошибка при выполнении трассировки: {e}"

def ping_host(host, count=3):
    """Пингует хост для проверки связи"""
    try:
        if sys.platform == "win32":
            ping_cmd = ["ping", "-n", str(count), host]
        else:
            ping_cmd = ["ping", "-c", str(count), host]
            
        proc = subprocess.Popen(ping_cmd, stdout=subprocess.PIPE, text=True)
        result = proc.communicate()[0]
        return result
    except Exception as e:
        return f"Ошибка при выполнении ping: {e}"

def test_endpoint(url, timeout=5):
    """Тестирует API-эндпоинт и возвращает результат"""
    try:
        print(f"Тестирование эндпоинта: {url}")
        
        # Замер времени выполнения запроса
        start_time = time.time()
        response = requests.get(url, timeout=timeout)
        elapsed = time.time() - start_time
        
        print(f"  Статус: {response.status_code} {response.reason} (за {elapsed:.2f} сек)")
        
        # Определение типа контента
        content_type = response.headers.get('Content-Type', 'unknown')
        print(f"  Тип контента: {content_type}")
        
        # Анализ размера ответа
        size = len(response.content)
        print(f"  Размер ответа: {size} байт")
        
        # Попытка вывести ответ как JSON
        try:
            if 'application/json' in content_type:
                data = response.json()
                print(f"  JSON данные: {type(data).__name__} с {len(data) if isinstance(data, (list, dict)) else 1} элементами")
            else:
                print(f"  Текстовый ответ (первые 100 символов): {response.text[:100]}")
                if len(response.text) > 100:
                    print("    ... [обрезано]")
        except Exception as e:
            print(f"  Ошибка при анализе данных: {e}")
        
        return True
    except requests.exceptions.ConnectionError as e:
        print(f"  ⚠️  Ошибка соединения: {e}")
        return False
    except requests.exceptions.Timeout as e:
        print(f"  ⚠️  Таймаут: {e}")
        return False
    except Exception as e:
        print(f"  ⚠️  Неожиданная ошибка: {type(e).__name__}: {e}")
        return False

def run_diagnostics():
    """Выполняет полную диагностику API-соединения"""
    print("\n==== ДИАГНОСТИКА API-СОЕДИНЕНИЯ ====\n")
    
    # Проверка основных портов
    print(f"1. Проверка доступности портов на {API_HOST}:")
    api_port_open = check_port(API_HOST, API_PORT)
    db_port_open = check_port(API_HOST, DB_PORT)
    
    print(f"  API порт {API_PORT}: {'ОТКРЫТ ✅' if api_port_open else 'ЗАКРЫТ ❌'}")
    print(f"  DB порт {DB_PORT}: {'ОТКРЫТ ✅' if db_port_open else 'ЗАКРЫТ ❌'}")
    
    # Проверка сетевой связности
    print(f"\n2. Проверка сетевой связности с {API_HOST}:")
    print("\nРезультаты ping:")
    print(ping_host(API_HOST))
    
    print("\nТрассировка маршрута:")
    print(trace_route(API_HOST))
    
    # Тестирование эндпоинтов API
    print(f"\n3. Проверка API-эндпоинтов:")
    success_count = 0
    
    for endpoint in TEST_ENDPOINTS:
        url = f"http://{API_HOST}:{API_PORT}{endpoint}"
        print(f"\n✧ Эндпоинт: {endpoint}")
        
        if test_endpoint(url):
            success_count += 1
    
    # Общий результат
    print("\n==== РЕЗУЛЬТАТЫ ДИАГНОСТИКИ ====")
    print(f"API порт: {'ДОСТУПЕН' if api_port_open else 'НЕДОСТУПЕН'}")
    print(f"DB порт: {'ДОСТУПЕН' if db_port_open else 'НЕДОСТУПЕН'}")
    print(f"Успешных API-запросов: {success_count} из {len(TEST_ENDPOINTS)}")
    
    if not api_port_open:
        print("\n⚠️ РЕКОМЕНДАЦИИ:")
        print("1. Проверьте, запущен ли API-сервер на Synology NAS")
        print("2. Проверьте, настроен ли правильный порт в Docker-контейнере")
        print("3. Проверьте сетевые настройки и файрволл на Synology NAS")
    
    if api_port_open and success_count == 0:
        print("\n⚠️ РЕКОМЕНДАЦИИ:")
        print("1. API-сервер запущен, но возвращает ошибки")
        print("2. Проверьте логи Docker: docker logs football_api")
        print("3. Возможны проблемы с подключением к базе данных")
    
    return api_port_open and success_count > 0

if __name__ == "__main__":
    if run_diagnostics():
        sys.exit(0)
    else:
        sys.exit(1) 