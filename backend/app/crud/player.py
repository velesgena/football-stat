from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.player import Player
from app.schemas.player import PlayerCreate, PlayerUpdate
from app.models.player_league_status import PlayerLeagueStatus
from app.schemas.player import PlayerLeagueStatusCreate, PlayerLeagueStatusUpdate

def get_player(db: Session, player_id: int) -> Optional[Player]:
    """Получение игрока по ID"""
    return db.query(Player).filter(Player.id == player_id).first()

def get_players(db: Session, skip: int = 0, limit: int = 100) -> List[Player]:
    """Получение списка игроков с пагинацией"""
    return db.query(Player).offset(skip).limit(limit).all()

def get_players_by_team(db: Session, team_id: int, skip: int = 0, limit: int = 100) -> List[Player]:
    """Получение игроков по команде"""
    return db.query(Player).filter(Player.team_id == team_id).offset(skip).limit(limit).all()

def get_players_by_nationality(db: Session, nationality: str, skip: int = 0, limit: int = 100) -> List[Player]:
    """Получение игроков по национальности"""
    return db.query(Player).filter(Player.nationality == nationality).offset(skip).limit(limit).all()

def get_active_players(db: Session, skip: int = 0, limit: int = 100) -> List[Player]:
    """Получение только активных игроков"""
    return db.query(Player).filter(Player.is_active == True).offset(skip).limit(limit).all()

def create_player(db: Session, player: PlayerCreate) -> Player:
    """Создание нового игрока"""
    player_data = player.dict()
    
    # Ensure position has a non-null value
    if player_data.get('position') is None:
        player_data['position'] = 'Не указана'  # Default value: "Not specified"
        
    db_player = Player(**player_data)
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

def update_player(db: Session, player_id: int, player_data: PlayerUpdate) -> Optional[Player]:
    """Обновление данных игрока"""
    db_player = get_player(db, player_id)
    if db_player:
        update_data = player_data.dict(exclude_unset=True)
            
        # Don't allow setting position to null
        if update_data.get('position') is None and 'position' in update_data:
            update_data.pop('position')  # Remove it rather than setting to null
            
        for key, value in update_data.items():
            setattr(db_player, key, value)
        db.commit()
        db.refresh(db_player)
    return db_player

def delete_player(db: Session, player_id: int) -> bool:
    """Удаление игрока"""
    db_player = get_player(db, player_id)
    if db_player:
        db.delete(db_player)
        db.commit()
        return True
    return False

def get_player_league_statuses(db: Session, player_id: int):
    return db.query(PlayerLeagueStatus).filter(PlayerLeagueStatus.player_id == player_id).all()

def create_player_league_status(db: Session, player_id: int, status: PlayerLeagueStatusCreate):
    db_status = PlayerLeagueStatus(player_id=player_id, **status.dict())
    db.add(db_status)
    db.commit()
    db.refresh(db_status)
    return db_status

def update_player_league_status(db: Session, pls_id: int, status: PlayerLeagueStatusUpdate):
    db_status = db.query(PlayerLeagueStatus).filter(PlayerLeagueStatus.id == pls_id).first()
    if db_status:
        for key, value in status.dict(exclude_unset=True).items():
            setattr(db_status, key, value)
        db.commit()
        db.refresh(db_status)
    return db_status

def delete_player_league_status(db: Session, pls_id: int):
    db_status = db.query(PlayerLeagueStatus).filter(PlayerLeagueStatus.id == pls_id).first()
    if db_status:
        db.delete(db_status)
        db.commit()
        return True
    return False 