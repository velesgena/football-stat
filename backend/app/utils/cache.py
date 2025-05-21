import functools
import inspect
import json
from typing import Any, Callable, Optional
import hashlib

from app.utils.redis import get_value, set_value
from app.utils.logging import get_logger

logger = get_logger("app.cache")

def create_cache_key(prefix: str, *args, **kwargs) -> str:
    """
    Создает ключ кеша на основе переданных аргументов.
    
    Args:
        prefix (str): Префикс ключа.
        *args: Позиционные аргументы.
        **kwargs: Именованные аргументы.
    
    Returns:
        str: Ключ кеша.
    """
    # Формируем строку из аргументов
    args_str = json.dumps(args, sort_keys=True) if args else ""
    kwargs_str = json.dumps(kwargs, sort_keys=True) if kwargs else ""
    
    # Создаем хеш из аргументов
    key = f"{prefix}:{hashlib.md5((args_str + kwargs_str).encode()).hexdigest()}"
    return key

def cache_result(ttl: int = 3600, prefix: Optional[str] = None):
    """
    Декоратор для кеширования результатов функций.
    
    Args:
        ttl (int, optional): Время жизни кеша в секундах. По умолчанию 3600 (1 час).
        prefix (str, optional): Префикс ключа кеша. По умолчанию имя функции.
    
    Returns:
        Callable: Декоратор.
    """
    def decorator(func):
        func_prefix = prefix or func.__name__
        
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            cache_key = create_cache_key(func_prefix, *args, **kwargs)
            
            # Пробуем получить результат из кеша
            cached_result = get_value(cache_key)
            if cached_result is not None:
                logger.debug(f"Результат получен из кеша: {cache_key}")
                return cached_result
            
            # Выполняем функцию, так как результата в кеше нет
            result = await func(*args, **kwargs)
            
            # Сохраняем результат в кеш
            set_value(cache_key, result, ttl)
            logger.debug(f"Результат сохранен в кеш: {cache_key}")
            
            return result
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            cache_key = create_cache_key(func_prefix, *args, **kwargs)
            
            # Пробуем получить результат из кеша
            cached_result = get_value(cache_key)
            if cached_result is not None:
                logger.debug(f"Результат получен из кеша: {cache_key}")
                return cached_result
            
            # Выполняем функцию, так как результата в кеше нет
            result = func(*args, **kwargs)
            
            # Сохраняем результат в кеш
            set_value(cache_key, result, ttl)
            logger.debug(f"Результат сохранен в кеш: {cache_key}")
            
            return result
        
        # Определяем, является ли функция асинхронной
        if inspect.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator 