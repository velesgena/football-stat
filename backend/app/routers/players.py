from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.player import PlayerCreate, PlayerUpdate, PlayerResponse, PlayerDetailResponse, PlayerLeagueStatusCreate, PlayerLeagueStatusUpdate, PlayerLeagueStatusResponse
from app.crud.player import (
    get_player, get_players, get_players_by_team, get_players_by_nationality, 
    get_active_players, create_player, update_player, delete_player,
    get_player_league_statuses, create_player_league_status, update_player_league_status, delete_player_league_status
)

router = APIRouter(
    prefix="/players",
    tags=["players"],
    responses={404: {"description": "Player not found"}},
)

@router.get("/", response_model=List[PlayerResponse])
def read_players(
    skip: int = 0, 
    limit: int = 100, 
    team_id: Optional[int] = None,
    nationality: Optional[str] = None,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """
    Получить список игроков.
    
    - **skip**: Сколько игроков пропустить (для пагинации)
    - **limit**: Максимальное количество игроков для возврата
    - **team_id**: Фильтрация по команде (если указана)
    - **nationality**: Фильтрация по национальности (если указана)
    - **active_only**: Фильтрация только активных игроков
    """
    if team_id:
        players = get_players_by_team(db, team_id, skip, limit)
    elif nationality:
        players = get_players_by_nationality(db, nationality, skip, limit)
    elif active_only:
        players = get_active_players(db, skip, limit)
    else:
        players = get_players(db, skip, limit)
    return players

@router.get("/{player_id}", response_model=PlayerDetailResponse)
def read_player(player_id: int, db: Session = Depends(get_db)):
    """
    Получить информацию о конкретном игроке по ID.
    
    - **player_id**: ID игрока
    """
    db_player = get_player(db, player_id)
    if db_player is None:
        raise HTTPException(status_code=404, detail="Player not found")
    return db_player

@router.post("/", response_model=PlayerResponse, status_code=status.HTTP_201_CREATED)
def create_new_player(player: PlayerCreate, db: Session = Depends(get_db)):
    """
    Создать нового игрока.
    
    - **first_name**: Имя игрока (обязательно)
    - **last_name**: Фамилия игрока (обязательно)
    - **nationality**: Гражданство (обязательно)
    - **position**: Позиция на поле (обязательно)
    - **team_id**, **city_id** и другие поля (опционально)
    """
    return create_player(db, player)

@router.put("/{player_id}", response_model=PlayerResponse)
def update_existing_player(player_id: int, player_data: PlayerUpdate, db: Session = Depends(get_db)):
    """
    Обновить информацию об игроке.
    
    - **player_id**: ID игрока для обновления
    - **player_data**: Данные для обновления (все поля опциональны)
    """
    db_player = update_player(db, player_id, player_data)
    if db_player is None:
        raise HTTPException(status_code=404, detail="Player not found")
    return db_player

@router.delete("/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_player(player_id: int, db: Session = Depends(get_db)):
    """
    Удалить игрока.
    
    - **player_id**: ID игрока для удаления
    """
    success = delete_player(db, player_id)
    if not success:
        raise HTTPException(status_code=404, detail="Player not found")
    return None

@router.get("/{player_id}/leagues_statuses", response_model=List[PlayerLeagueStatusResponse])
def get_leagues_statuses(player_id: int, db: Session = Depends(get_db)):
    return get_player_league_statuses(db, player_id)

@router.post("/{player_id}/leagues_statuses", response_model=PlayerLeagueStatusResponse)
def add_league_status(player_id: int, status: PlayerLeagueStatusCreate, db: Session = Depends(get_db)):
    return create_player_league_status(db, player_id, status)

@router.put("/leagues_statuses/{pls_id}", response_model=PlayerLeagueStatusResponse)
def update_league_status(pls_id: int, status: PlayerLeagueStatusUpdate, db: Session = Depends(get_db)):
    return update_player_league_status(db, pls_id, status)

@router.delete("/leagues_statuses/{pls_id}")
def delete_league_status(pls_id: int, db: Session = Depends(get_db)):
    return delete_player_league_status(db, pls_id) 