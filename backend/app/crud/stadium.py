from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.stadium import Stadium
from app.schemas.stadium import StadiumCreate, StadiumUpdate

def get_stadium(db: Session, stadium_id: int) -> Optional[Stadium]:
    """Получение стадиона по ID"""
    return db.query(Stadium).filter(Stadium.id == stadium_id).first()

def get_stadiums(db: Session, skip: int = 0, limit: int = 100) -> List[Stadium]:
    """Получение списка стадионов с пагинацией и подгрузкой города"""
    return db.query(Stadium).options(joinedload(Stadium.city)).offset(skip).limit(limit).all()

def get_stadiums_by_city(db: Session, city_id: int, skip: int = 0, limit: int = 100) -> List[Stadium]:
    """Получение стадионов по городу с подгрузкой города"""
    return db.query(Stadium).options(joinedload(Stadium.city)).filter(Stadium.city_id == city_id).offset(skip).limit(limit).all()

def create_stadium(db: Session, stadium: StadiumCreate) -> Stadium:
    """Создание нового стадиона"""
    db_stadium = Stadium(**stadium.dict())
    db.add(db_stadium)
    db.commit()
    db.refresh(db_stadium)
    return db_stadium

def update_stadium(db: Session, stadium_id: int, stadium_data: StadiumUpdate) -> Optional[Stadium]:
    """Обновление данных стадиона"""
    db_stadium = get_stadium(db, stadium_id)
    if db_stadium:
        update_data = stadium_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_stadium, key, value)
        db.commit()
        db.refresh(db_stadium)
    return db_stadium

def delete_stadium(db: Session, stadium_id: int) -> bool:
    """Удаление стадиона"""
    db_stadium = get_stadium(db, stadium_id)
    if db_stadium:
        db.delete(db_stadium)
        db.commit()
        return True
    return False 