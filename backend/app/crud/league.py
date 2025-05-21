from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.league import League
from app.schemas.league import LeagueCreate, LeagueUpdate

def get_league(db: Session, league_id: int) -> Optional[League]:
    """Получение лиги по ID"""
    return db.query(League).filter(League.id == league_id).first()

def get_leagues(db: Session, skip: int = 0, limit: int = 100) -> List[League]:
    """Получение списка лиг с пагинацией"""
    return db.query(League).offset(skip).limit(limit).all()

def get_leagues_by_country(db: Session, country: str, skip: int = 0, limit: int = 100) -> List[League]:
    """Получение лиг по стране"""
    return db.query(League).filter(League.country == country).offset(skip).limit(limit).all()

def create_league(db: Session, league: LeagueCreate) -> League:
    """Создание новой лиги"""
    db_league = League(**league.dict())
    db.add(db_league)
    db.commit()
    db.refresh(db_league)
    return db_league

def update_league(db: Session, league_id: int, league_data: LeagueUpdate) -> Optional[League]:
    """Обновление данных лиги"""
    db_league = get_league(db, league_id)
    if db_league:
        update_data = league_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_league, key, value)
        db.commit()
        db.refresh(db_league)
    return db_league

def delete_league(db: Session, league_id: int) -> bool:
    """Удаление лиги"""
    db_league = get_league(db, league_id)
    if db_league:
        db.delete(db_league)
        db.commit()
        return True
    return False 