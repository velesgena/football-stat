from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
import logging
import json

from app.database import get_db
from app.schemas.city import CityCreate, CityUpdate, CityResponse
from app.crud.city import get_city, get_cities, get_cities_by_country, create_city, update_city, delete_city

# Настройка логгера
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/cities",
    tags=["cities"],
    responses={404: {"description": "City not found"}},
)

@router.get("/", response_model=List[CityResponse])
def read_cities(
    skip: int = 0, 
    limit: int = 100, 
    country: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Получить список населенных пунктов.
    
    - **skip**: Сколько населенных пунктов пропустить (для пагинации)
    - **limit**: Максимальное количество населенных пунктов для возврата
    - **country**: Фильтрация по стране (если указана)
    """
    if country:
        cities = get_cities_by_country(db, country, skip, limit)
    else:
        cities = get_cities(db, skip, limit)
    return cities

@router.get("/{city_id}", response_model=CityResponse)
def read_city(city_id: int, db: Session = Depends(get_db)):
    """
    Получить информацию о конкретном населенном пункте по ID.
    
    - **city_id**: ID населенного пункта
    """
    db_city = get_city(db, city_id)
    if db_city is None:
        raise HTTPException(status_code=404, detail="City not found")
    return db_city

@router.post("/", response_model=CityResponse, status_code=status.HTTP_201_CREATED)
async def create_new_city(request: Request, db: Session = Depends(get_db)):
    """
    Создать новый населенный пункт.
    
    - **name**: Название (обязательно)
    - **country**: Страна (обязательно)
    - **population**: Население (опционально)
    """
    # Получаем данные из запроса
    try:
        body = await request.json()
        logger.info(f"Создание населенного пункта, входные данные: {body}")
        logger.info(f"Заголовки запроса: {request.headers}")
        
        # Проверка обязательных полей
        if not body.get("name"):
            raise HTTPException(status_code=422, detail="Название города обязательно")
        
        if not body.get("country"):
            raise HTTPException(status_code=422, detail="Страна обязательна")
        
        # Обработка поля population
        if "population" in body:
            if body["population"] in ["", None]:
                body["population"] = None
            elif not isinstance(body["population"], int):
                try:
                    body["population"] = int(body["population"])
                except (ValueError, TypeError):
                    raise HTTPException(status_code=422, detail="Население должно быть числом")
        
        # Создание модели CityCreate
        try:
            city_data = CityCreate(**body)
            logger.info(f"Создана модель CityCreate: {city_data}")
        except Exception as e:
            logger.error(f"Ошибка создания модели CityCreate: {str(e)}")
            raise HTTPException(status_code=422, detail=f"Ошибка валидации данных: {str(e)}")
        
        # Создание города в БД
        try:
            result = create_city(db, city_data)
            logger.info(f"Населенный пункт успешно создан: {result.id}")
            return result
        except Exception as e:
            logger.error(f"Ошибка при создании населенного пункта в БД: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка создания в базе данных: {str(e)}"
            )
    except json.JSONDecodeError:
        logger.error("Ошибка декодирования JSON")
        raise HTTPException(status_code=400, detail="Неверный формат JSON")
    except Exception as e:
        logger.error(f"Необработанная ошибка: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@router.put("/{city_id}", response_model=CityResponse)
async def update_existing_city(city_id: int, request: Request, db: Session = Depends(get_db)):
    """
    Обновить информацию о населенном пункте.
    
    - **city_id**: ID населенного пункта для обновления
    - **name**: Название (опционально)
    - **country**: Страна (опционально)
    - **population**: Население (опционально)
    """
    # Проверяем существование города
    db_city = get_city(db, city_id)
    if db_city is None:
        raise HTTPException(status_code=404, detail="City not found")
    
    # Получаем данные из запроса
    try:
        body = await request.json()
        logger.info(f"Обновление населенного пункта {city_id}, входные данные: {body}")
        
        # Проверка данных для обновления
        if not body:
            raise HTTPException(status_code=422, detail="Необходимо указать хотя бы одно поле для обновления")
        
        # Обработка поля population
        if "population" in body:
            if body["population"] in ["", None]:
                body["population"] = None
            elif not isinstance(body["population"], int):
                try:
                    body["population"] = int(body["population"])
                except (ValueError, TypeError):
                    raise HTTPException(status_code=422, detail="Население должно быть числом")
        
        # Создание модели CityUpdate
        try:
            update_data = CityUpdate(**body)
            logger.info(f"Создана модель CityUpdate: {update_data}")
        except Exception as e:
            logger.error(f"Ошибка создания модели CityUpdate: {str(e)}")
            raise HTTPException(status_code=422, detail=f"Ошибка валидации данных: {str(e)}")
        
        # Обновление города в БД
        try:
            updated_city = update_city(db, city_id, update_data)
            logger.info(f"Населенный пункт {city_id} успешно обновлен")
            return updated_city
        except Exception as e:
            logger.error(f"Ошибка при обновлении населенного пункта в БД: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка обновления в базе данных: {str(e)}"
            )
    except json.JSONDecodeError:
        logger.error("Ошибка декодирования JSON")
        raise HTTPException(status_code=400, detail="Неверный формат JSON")
    except Exception as e:
        logger.error(f"Необработанная ошибка: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")

@router.delete("/{city_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_city(city_id: int, db: Session = Depends(get_db)):
    """
    Удалить населенный пункт.
    
    - **city_id**: ID населенного пункта для удаления
    """
    success = delete_city(db, city_id)
    if not success:
        raise HTTPException(status_code=404, detail="City not found")
    return None 