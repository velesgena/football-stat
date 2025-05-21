from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app.models.team import Team
from app.schemas.team import TeamCreate, TeamUpdate

def get_team(db: Session, team_id: int) -> Optional[Team]:
    """Получение команды по ID"""
    return db.query(Team).filter(Team.id == team_id).first()

def get_teams(db: Session, skip: int = 0, limit: int = 100) -> List[Team]:
    """Получение списка команд с пагинацией и городом"""
    return db.query(Team).options(joinedload(Team.city)).offset(skip).limit(limit).all()

def get_teams_by_league(db: Session, league_id: int, skip: int = 0, limit: int = 100) -> List[Team]:
    """Получение команд по лиге"""
    return db.query(Team).filter(Team.league_id == league_id).offset(skip).limit(limit).all()

def get_teams_by_city(db: Session, city_id: int, skip: int = 0, limit: int = 100) -> List[Team]:
    """Получение команд по городу"""
    return db.query(Team).filter(Team.city_id == city_id).offset(skip).limit(limit).all()

def get_teams_by_country(db: Session, country: str, skip: int = 0, limit: int = 100) -> List[Team]:
    """Получение команд по стране"""
    return db.query(Team).filter(Team.country == country).offset(skip).limit(limit).all()

def create_team(db: Session, team: TeamCreate) -> Team:
    """Создание новой команды"""
    db_team = Team(**team.dict())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

def update_team(db: Session, team_id: int, team_data: TeamUpdate) -> Optional[Team]:
    """Обновление данных команды"""
    db_team = get_team(db, team_id)
    if db_team:
        update_data = team_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_team, key, value)
        db.commit()
        db.refresh(db_team)
    return db_team

def delete_team(db: Session, team_id: int) -> bool:
    """Удаление команды"""
    db_team = get_team(db, team_id)
    if db_team:
        db.delete(db_team)
        db.commit()
        return True
    return False 