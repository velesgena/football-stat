from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.stadium import StadiumCreate, StadiumUpdate, StadiumResponse
from app.crud.stadium import get_stadium, get_stadiums, get_stadiums_by_city, create_stadium, update_stadium, delete_stadium

router = APIRouter(
    prefix="/stadiums",
    tags=["stadiums"],
    responses={404: {"description": "Stadium not found"}},
)

@router.get("/", response_model=List[StadiumResponse])
def read_stadiums(
    skip: int = 0, 
    limit: int = 100, 
    city_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Получить список стадионов.
    
    - **skip**: Сколько стадионов пропустить (для пагинации)
    - **limit**: Максимальное количество стадионов для возврата
    - **city_id**: Фильтрация по городу (если указан)
    """
    if city_id:
        stadiums = get_stadiums_by_city(db, city_id, skip, limit)
    else:
        stadiums = get_stadiums(db, skip, limit)
    return stadiums

@router.get("/{stadium_id}", response_model=StadiumResponse)
def read_stadium(stadium_id: int, db: Session = Depends(get_db)):
    """
    Получить информацию о конкретном стадионе по ID.
    
    - **stadium_id**: ID стадиона
    """
    db_stadium = get_stadium(db, stadium_id)
    if db_stadium is None:
        raise HTTPException(status_code=404, detail="Stadium not found")
    return db_stadium

@router.post("/", response_model=StadiumResponse, status_code=status.HTTP_201_CREATED)
def create_new_stadium(stadium: StadiumCreate, db: Session = Depends(get_db)):
    """
    Создать новый стадион.
    
    - **name**: Название (обязательно)
    - **city_id**: ID города (обязательно)
    - **capacity**: Вместимость (опционально)
    - **address**: Адрес (опционально)
    - **description**: Описание (опционально)
    - **photo_url**: URL фотографии (опционально)
    """
    return create_stadium(db, stadium)

@router.put("/{stadium_id}", response_model=StadiumResponse)
def update_existing_stadium(stadium_id: int, stadium_data: StadiumUpdate, db: Session = Depends(get_db)):
    """
    Обновить информацию о стадионе.
    
    - **stadium_id**: ID стадиона для обновления
    - **stadium_data**: Данные для обновления (все поля опциональны)
    """
    db_stadium = update_stadium(db, stadium_id, stadium_data)
    if db_stadium is None:
        raise HTTPException(status_code=404, detail="Stadium not found")
    return db_stadium

@router.delete("/{stadium_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_stadium(stadium_id: int, db: Session = Depends(get_db)):
    """
    Удалить стадион.
    
    - **stadium_id**: ID стадиона для удаления
    """
    success = delete_stadium(db, stadium_id)
    if not success:
        raise HTTPException(status_code=404, detail="Stadium not found")
    return None 