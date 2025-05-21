import os
import sys
import logging
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from pathlib import Path

# Задаем базовые настройки для директории логов
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
LOG_DIR = os.getenv("LOG_DIR", Path(__file__).parent.parent.parent / "logs")

# Гарантируем, что директория логов существует
os.makedirs(LOG_DIR, exist_ok=True)

def setup_logger(name=None, log_file=None, level=None, rotation_type="size"):
    """
    Настраивает и возвращает логгер с заданными параметрами.
    
    Args:
        name (str, optional): Имя логгера. По умолчанию None (корневой логгер).
        log_file (str, optional): Путь к файлу лога. По умолчанию None (только консоль).
        level (str, optional): Уровень логирования. По умолчанию берется из LOG_LEVEL.
        rotation_type (str, optional): Тип ротации логов - "size" или "time". По умолчанию "size".
    
    Returns:
        logging.Logger: Настроенный логгер.
    """
    # Определяем уровень логирования
    level = getattr(logging, level or LOG_LEVEL)
    
    # Получаем или создаем логгер
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Если у логгера уже есть обработчики, просто возвращаем его
    if logger.handlers:
        return logger
    
    # Создаем форматтер
    formatter = logging.Formatter(LOG_FORMAT)
    
    # Добавляем обработчик для вывода в консоль
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Если указан файл, добавляем файловый обработчик с ротацией
    if log_file:
        log_path = os.path.join(LOG_DIR, log_file)
        
        if rotation_type == "time":
            # Ротация по времени (ежедневная)
            file_handler = TimedRotatingFileHandler(
                log_path, when="midnight", interval=1, backupCount=30
            )
        else:
            # Ротация по размеру (по умолчанию - 10MB)
            file_handler = RotatingFileHandler(
                log_path, maxBytes=10*1024*1024, backupCount=5
            )
        
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger

def get_logger(name, log_file=None):
    """
    Возвращает настроенный логгер по имени. Если логгер с таким именем уже существует,
    возвращает его, иначе создает новый.
    
    Args:
        name (str): Имя логгера.
        log_file (str, optional): Путь к файлу лога. По умолчанию None.
    
    Returns:
        logging.Logger: Логгер с указанным именем.
    """
    if not log_file:
        # Если файл не указан, используем имя модуля с расширением .log
        log_file = f"{name.replace('.', '_')}.log"
    
    return setup_logger(name, log_file)

# Настройка корневого логгера
root_logger = setup_logger(log_file="app.log")

# Настройка специализированных логгеров для разных частей приложения
api_logger = get_logger("app.api", "api.log")
db_logger = get_logger("app.db", "db.log")
auth_logger = get_logger("app.auth", "auth.log") 