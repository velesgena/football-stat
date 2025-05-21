from typing import List, Optional
import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.models.city import City
from app.schemas.city import CityCreate, CityUpdate

# Настройка логгера
logger = logging.getLogger(__name__)

def get_city(db: Session, city_id: int) -> Optional[City]:
    """Получение населенного пункта по ID"""
    return db.query(City).filter(City.id == city_id).first()

def get_cities(db: Session, skip: int = 0, limit: int = 100) -> List[City]:
    """Получение списка населенных пунктов с пагинацией"""
    return db.query(City).offset(skip).limit(limit).all()

def get_cities_by_country(db: Session, country: str, skip: int = 0, limit: int = 100) -> List[City]:
    """Получение населенных пунктов по стране"""
    return db.query(City).filter(City.country == country).offset(skip).limit(limit).all()

def create_city(db: Session, city: CityCreate) -> City:
    """Создание нового населенного пункта"""
    logger.debug(f"Получены данные для создания города: {city}")
    
    try:
        # Используем только model_dump() для совместимости с Pydantic v2
        city_data = city.model_dump()
        logger.debug(f"Преобразованные данные: {city_data}")
        
        db_city = City(**city_data)
        logger.debug(f"Создан объект модели города: {db_city}")
        
        db.add(db_city)
        logger.debug("Город добавлен в сессию")
        
        db.commit()
        logger.debug("Транзакция зафиксирована")
        
        db.refresh(db_city)
        logger.debug(f"Город создан с ID: {db_city.id}")
        
        return db_city
    except SQLAlchemyError as e:
        logger.error(f"Ошибка SQLAlchemy при создании города: {str(e)}")
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"Неожиданная ошибка при создании города: {str(e)}")
        db.rollback()
        raise

def update_city(db: Session, city_id: int, city_data: CityUpdate) -> Optional[City]:
    """Обновление данных населенного пункта"""
    db_city = get_city(db, city_id)
    if db_city:
        # Используем только model_dump() для совместимости с Pydantic v2
        update_data = city_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_city, key, value)
        db.commit()
        db.refresh(db_city)
    return db_city

def delete_city(db: Session, city_id: int) -> bool:
    """Удаление населенного пункта"""
    db_city = get_city(db, city_id)
    if db_city:
        db.delete(db_city)
        db.commit()
        return True
    return False 