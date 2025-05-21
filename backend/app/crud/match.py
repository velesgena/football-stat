from typing import List, Optional, Union
from datetime import date
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from app.models.match import Match, MatchStatus
from app.schemas.match import MatchCreate, MatchUpdate

def get_match(db: Session, match_id: int) -> Optional[Match]:
    """Получение матча по ID"""
    return db.query(Match).options(
        joinedload(Match.stadium),
        joinedload(Match.home_team),
        joinedload(Match.away_team),
        joinedload(Match.tournament),
        joinedload(Match.referee)
    ).filter(Match.id == match_id).first()

def get_matches(db: Session, skip: int = 0, limit: int = 100) -> List[Match]:
    """Получение списка матчей с пагинацией"""
    return db.query(Match).options(
        joinedload(Match.stadium),
        joinedload(Match.home_team),
        joinedload(Match.away_team),
        joinedload(Match.tournament),
        joinedload(Match.referee)
    ).order_by(Match.match_date.desc()).offset(skip).limit(limit).all()

def get_matches_by_team(db: Session, team_id: int, skip: int = 0, limit: int = 100) -> List[Match]:
    """Получение матчей по команде (как домашней, так и гостевой)"""
    return db.query(Match).options(
        joinedload(Match.stadium),
        joinedload(Match.home_team),
        joinedload(Match.away_team),
        joinedload(Match.tournament),
        joinedload(Match.referee)
    ).filter(
        (Match.home_team_id == team_id) | (Match.away_team_id == team_id)
    ).order_by(Match.match_date.desc()).offset(skip).limit(limit).all()

def get_matches_by_tournament(db: Session, tournament_id: int, skip: int = 0, limit: int = 100) -> List[Match]:
    """Получение матчей по турниру"""
    return db.query(Match).options(
        joinedload(Match.stadium),
        joinedload(Match.home_team),
        joinedload(Match.away_team),
        joinedload(Match.tournament),
        joinedload(Match.referee)
    ).filter(Match.tournament_id == tournament_id).order_by(Match.match_date.desc()).offset(skip).limit(limit).all()

def get_matches_by_stadium(db: Session, stadium_id: int, skip: int = 0, limit: int = 100) -> List[Match]:
    """Получение матчей по стадиону"""
    return db.query(Match).options(
        joinedload(Match.stadium),
        joinedload(Match.home_team),
        joinedload(Match.away_team),
        joinedload(Match.tournament),
        joinedload(Match.referee)
    ).filter(Match.stadium_id == stadium_id).order_by(Match.match_date.desc()).offset(skip).limit(limit).all()

def get_matches_by_date_range(db: Session, start_date: date, end_date: date, skip: int = 0, limit: int = 100) -> List[Match]:
    """Получение матчей по диапазону дат"""
    return db.query(Match).options(
        joinedload(Match.stadium),
        joinedload(Match.home_team),
        joinedload(Match.away_team),
        joinedload(Match.tournament),
        joinedload(Match.referee)
    ).filter(
        and_(Match.match_date >= start_date, Match.match_date <= end_date)
    ).order_by(Match.match_date.desc()).offset(skip).limit(limit).all()

def get_matches_by_status(db: Session, status: MatchStatus, skip: int = 0, limit: int = 100) -> List[Match]:
    """Получение матчей по статусу"""
    return db.query(Match).options(
        joinedload(Match.stadium),
        joinedload(Match.home_team),
        joinedload(Match.away_team),
        joinedload(Match.tournament),
        joinedload(Match.referee)
    ).filter(Match.status == status).order_by(Match.match_date.desc()).offset(skip).limit(limit).all()

def create_match(db: Session, match: MatchCreate) -> Match:
    """Создание нового матча"""
    db_match = Match(**match.dict())
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

def update_match(db: Session, match_id: int, match_data: MatchUpdate) -> Optional[Match]:
    """Обновление данных матча"""
    db_match = get_match(db, match_id)
    if db_match:
        update_data = match_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_match, key, value)
        db.commit()
        db.refresh(db_match)
    return db_match

def delete_match(db: Session, match_id: int) -> bool:
    """Удаление матча"""
    db_match = get_match(db, match_id)
    if db_match:
        db.delete(db_match)
        db.commit()
        return True
    return False 