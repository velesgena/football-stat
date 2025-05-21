from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.tournament import TournamentCreate, TournamentUpdate, TournamentResponse, TournamentDetailResponse
from app.models.tournament import TournamentType
from app.crud.tournament import (
    get_tournament, get_tournaments, get_tournaments_by_league, get_tournaments_by_season,
    get_tournaments_by_type, create_tournament, update_tournament, delete_tournament
)

router = APIRouter(
    prefix="/tournaments",
    tags=["tournaments"],
    responses={404: {"description": "Tournament not found"}},
)

@router.get("/", response_model=List[TournamentResponse])
def read_tournaments(
    skip: int = 0, 
    limit: int = 100, 
    league_id: Optional[int] = None,
    season: Optional[str] = None,
    tournament_type: Optional[TournamentType] = None,
    db: Session = Depends(get_db)
):
    """
    Получить список турниров.
    
    - **skip**: Сколько турниров пропустить (для пагинации)
    - **limit**: Максимальное количество турниров для возврата
    - **league_id**: Фильтрация по лиге (если указана)
    - **season**: Фильтрация по сезону (если указан)
    - **tournament_type**: Фильтрация по типу турнира (если указан)
    """
    if league_id:
        tournaments = get_tournaments_by_league(db, league_id, skip, limit)
    elif season:
        tournaments = get_tournaments_by_season(db, season, skip, limit)
    elif tournament_type:
        tournaments = get_tournaments_by_type(db, tournament_type, skip, limit)
    else:
        tournaments = get_tournaments(db, skip, limit)
    return tournaments

@router.get("/{tournament_id}", response_model=TournamentDetailResponse)
def read_tournament(tournament_id: int, db: Session = Depends(get_db)):
    """
    Получить информацию о конкретном турнире по ID.
    
    - **tournament_id**: ID турнира
    """
    db_tournament = get_tournament(db, tournament_id)
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return db_tournament

@router.post("/", response_model=TournamentResponse, status_code=status.HTTP_201_CREATED)
def create_new_tournament(tournament: TournamentCreate, db: Session = Depends(get_db)):
    """
    Создать новый турнир.
    
    - **name**: Название турнира (обязательно)
    - **season**: Сезон (обязательно)
    - **type**: Тип турнира (по умолчанию - league)
    - **league_id**, **start_date**, **end_date** и другие поля (опционально)
    """
    return create_tournament(db, tournament)

@router.put("/{tournament_id}", response_model=TournamentResponse)
def update_existing_tournament(tournament_id: int, tournament_data: TournamentUpdate, db: Session = Depends(get_db)):
    """
    Обновить информацию о турнире.
    
    - **tournament_id**: ID турнира для обновления
    - **tournament_data**: Данные для обновления (все поля опциональны)
    """
    db_tournament = update_tournament(db, tournament_id, tournament_data)
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return db_tournament

@router.delete("/{tournament_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_tournament(tournament_id: int, db: Session = Depends(get_db)):
    """
    Удалить турнир.
    
    - **tournament_id**: ID турнира для удаления
    """
    success = delete_tournament(db, tournament_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return None 