import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Получаем строку подключения из переменной окружения или используем PostgreSQL по умолчанию (порт 5433)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:pam@192.168.1.124:5433/football")

# Пытаемся подключиться к PostgreSQL
try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(DATABASE_URL)
        # Тестовое подключение
        with engine.connect() as conn:
            conn.execute("SELECT 1")
    logger.info(f"Успешное подключение к БД: {DATABASE_URL}")
except Exception as e:
    # При ошибке подключения к PostgreSQL, используем SQLite
    logger.error(f"Не удалось подключиться к {DATABASE_URL}: {e}")
    logger.info("Переключение на SQLite...")
    DATABASE_URL = "sqlite:///./test.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    logger.info(f"Подключено к SQLite: {DATABASE_URL}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 