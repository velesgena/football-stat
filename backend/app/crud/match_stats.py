from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.match_stats import MatchStats
from app.schemas.match_stats import MatchStatsCreate, MatchStatsUpdate

def get_match_stats(db: Session, match_stats_id: int) -> Optional[MatchStats]:
    """Получение статистики матча по ID"""
    return db.query(MatchStats).filter(MatchStats.id == match_stats_id).first()

def get_all_match_stats(db: Session, skip: int = 0, limit: int = 100) -> List[MatchStats]:
    """Получение списка статистики матчей с пагинацией"""
    return db.query(MatchStats).offset(skip).limit(limit).all()

def get_match_stats_by_match(db: Session, match_id: int, skip: int = 0, limit: int = 100) -> List[MatchStats]:
    """Получение статистики по матчу"""
    return db.query(MatchStats).filter(MatchStats.match_id == match_id).offset(skip).limit(limit).all()

def get_match_stats_by_player(db: Session, player_id: int, skip: int = 0, limit: int = 100) -> List[MatchStats]:
    """Получение статистики по игроку"""
    return db.query(MatchStats).filter(MatchStats.player_id == player_id).offset(skip).limit(limit).all()

def get_match_stats_by_team(db: Session, team_id: int, skip: int = 0, limit: int = 100) -> List[MatchStats]:
    """Получение статистики по команде"""
    return db.query(MatchStats).filter(MatchStats.team_id == team_id).offset(skip).limit(limit).all()

def get_match_stats_by_match_and_player(db: Session, match_id: int, player_id: int) -> Optional[MatchStats]:
    """Получение статистики конкретного игрока в конкретном матче"""
    return db.query(MatchStats).filter(
        and_(MatchStats.match_id == match_id, MatchStats.player_id == player_id)
    ).first()

def get_match_stats_by_match_and_team(db: Session, match_id: int, team_id: int) -> List[MatchStats]:
    """Получение статистики команды в конкретном матче"""
    return db.query(MatchStats).filter(
        and_(MatchStats.match_id == match_id, MatchStats.team_id == team_id)
    ).all()

def create_match_stats(db: Session, match_stats: MatchStatsCreate) -> MatchStats:
    """Создание новой статистики матча"""
    db_match_stats = MatchStats(**match_stats.dict())
    db.add(db_match_stats)
    db.commit()
    db.refresh(db_match_stats)
    return db_match_stats

def update_match_stats(db: Session, match_stats_id: int, match_stats_data: MatchStatsUpdate) -> Optional[MatchStats]:
    """Обновление данных статистики матча"""
    db_match_stats = get_match_stats(db, match_stats_id)
    if db_match_stats:
        update_data = match_stats_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_match_stats, key, value)
        db.commit()
        db.refresh(db_match_stats)
    return db_match_stats

def delete_match_stats(db: Session, match_stats_id: int) -> bool:
    """Удаление статистики матча"""
    db_match_stats = get_match_stats(db, match_stats_id)
    if db_match_stats:
        db.delete(db_match_stats)
        db.commit()
        return True
    return False

def delete_match_stats_by_match(db: Session, match_id: int) -> int:
    """Удаление всей статистики для указанного матча"""
    match_stats = get_match_stats_by_match(db, match_id)
    count = len(match_stats)
    for stat in match_stats:
        db.delete(stat)
    db.commit()
    return count 