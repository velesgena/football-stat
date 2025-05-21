import os
import json
import redis
from typing import Any, Dict, List, Optional, Union
from app.utils.logging import get_logger

logger = get_logger("app.redis")

# Получение URL Redis из переменных окружения или использование значения по умолчанию
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Настройка времени жизни кеша по умолчанию (в секундах)
DEFAULT_TTL = 3600  # 1 час

# Создание соединения с Redis
try:
    redis_client = redis.from_url(REDIS_URL)
    logger.info(f"Установлено соединение с Redis: {REDIS_URL}")
except Exception as e:
    logger.error(f"Ошибка подключения к Redis: {str(e)}")
    redis_client = None

def is_connected() -> bool:
    """Проверяет, установлено ли соединение с Redis."""
    if redis_client is None:
        return False
    
    try:
        redis_client.ping()
        return True
    except redis.exceptions.ConnectionError:
        logger.warning("Соединение с Redis отсутствует")
        return False

def set_value(key: str, value: Any, ttl: int = DEFAULT_TTL) -> bool:
    """
    Сохраняет значение в Redis с заданным временем жизни.
    
    Args:
        key (str): Ключ для сохранения.
        value (Any): Значение для сохранения (будет преобразовано в JSON).
        ttl (int, optional): Время жизни в секундах. По умолчанию DEFAULT_TTL.
    
    Returns:
        bool: True, если операция успешна, иначе False.
    """
    if not is_connected():
        return False
    
    try:
        serialized_value = json.dumps(value)
        redis_client.setex(key, ttl, serialized_value)
        logger.debug(f"Значение для ключа '{key}' сохранено в Redis с TTL={ttl}")
        return True
    except Exception as e:
        logger.error(f"Ошибка при сохранении значения в Redis: {str(e)}")
        return False

def get_value(key: str) -> Optional[Any]:
    """
    Получает значение из Redis по ключу.
    
    Args:
        key (str): Ключ для получения.
    
    Returns:
        Optional[Any]: Значение, если ключ существует, иначе None.
    """
    if not is_connected():
        return None
    
    try:
        value = redis_client.get(key)
        if value is None:
            logger.debug(f"Ключ '{key}' не найден в Redis")
            return None
        
        return json.loads(value)
    except Exception as e:
        logger.error(f"Ошибка при получении значения из Redis: {str(e)}")
        return None

def delete_value(key: str) -> bool:
    """
    Удаляет значение из Redis по ключу.
    
    Args:
        key (str): Ключ для удаления.
    
    Returns:
        bool: True, если ключ был удален, иначе False.
    """
    if not is_connected():
        return False
    
    try:
        result = redis_client.delete(key)
        if result > 0:
            logger.debug(f"Ключ '{key}' удален из Redis")
            return True
        else:
            logger.debug(f"Ключ '{key}' не найден в Redis")
            return False
    except Exception as e:
        logger.error(f"Ошибка при удалении значения из Redis: {str(e)}")
        return False

def clear_cache(pattern: str = "*") -> int:
    """
    Очищает кеш по заданному шаблону.
    
    Args:
        pattern (str, optional): Шаблон ключей для удаления. По умолчанию "*".
    
    Returns:
        int: Количество удаленных ключей.
    """
    if not is_connected():
        return 0
    
    try:
        keys = redis_client.keys(pattern)
        if not keys:
            logger.debug(f"Нет ключей, соответствующих шаблону '{pattern}'")
            return 0
        
        count = redis_client.delete(*keys)
        logger.info(f"Удалено {count} ключей по шаблону '{pattern}'")
        return count
    except Exception as e:
        logger.error(f"Ошибка при очистке кеша Redis: {str(e)}")
        return 0

def increment(key: str, amount: int = 1) -> Optional[int]:
    """
    Увеличивает числовое значение по ключу.
    
    Args:
        key (str): Ключ для увеличения.
        amount (int, optional): Величина увеличения. По умолчанию 1.
    
    Returns:
        Optional[int]: Новое значение или None в случае ошибки.
    """
    if not is_connected():
        return None
    
    try:
        result = redis_client.incrby(key, amount)
        logger.debug(f"Значение ключа '{key}' увеличено на {amount}, новое значение: {result}")
        return result
    except Exception as e:
        logger.error(f"Ошибка при увеличении значения в Redis: {str(e)}")
        return None 