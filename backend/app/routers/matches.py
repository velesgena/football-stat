from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.match import MatchCreate, MatchUpdate, MatchResponse, MatchDetailResponse
from app.models.match import MatchStatus
from app.crud.match import (
    get_match, get_matches, get_matches_by_team, get_matches_by_tournament,
    get_matches_by_stadium, get_matches_by_date_range, get_matches_by_status,
    create_match, update_match, delete_match
)

router = APIRouter(
    prefix="/matches",
    tags=["matches"],
    responses={404: {"description": "Match not found"}},
)

@router.get("/", response_model=List[MatchResponse])
def read_matches(
    skip: int = 0, 
    limit: int = 100, 
    team_id: Optional[int] = None,
    tournament_id: Optional[int] = None,
    stadium_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    status: Optional[MatchStatus] = None,
    db: Session = Depends(get_db)
):
    """
    Получить список матчей.
    
    - **skip**: Сколько матчей пропустить (для пагинации)
    - **limit**: Максимальное количество матчей для возврата
    - **team_id**: Фильтрация по команде (если указана)
    - **tournament_id**: Фильтрация по турниру (если указан)
    - **stadium_id**: Фильтрация по стадиону (если указан)
    - **start_date**: Начальная дата для фильтрации (если указана)
    - **end_date**: Конечная дата для фильтрации (если указана)
    - **status**: Фильтрация по статусу матча (если указан)
    """
    if team_id:
        matches = get_matches_by_team(db, team_id, skip, limit)
    elif tournament_id:
        matches = get_matches_by_tournament(db, tournament_id, skip, limit)
    elif stadium_id:
        matches = get_matches_by_stadium(db, stadium_id, skip, limit)
    elif start_date and end_date:
        matches = get_matches_by_date_range(db, start_date, end_date, skip, limit)
    elif status:
        matches = get_matches_by_status(db, status, skip, limit)
    else:
        matches = get_matches(db, skip, limit)
    return matches

@router.get("/{match_id}", response_model=MatchDetailResponse)
def read_match(match_id: int, db: Session = Depends(get_db)):
    """
    Получить информацию о конкретном матче по ID.
    
    - **match_id**: ID матча
    """
    db_match = get_match(db, match_id)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match

@router.post("/", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
def create_new_match(match: MatchCreate, db: Session = Depends(get_db)):
    """
    Создать новый матч.
    
    - **home_team_id**: ID домашней команды (обязательно)
    - **away_team_id**: ID гостевой команды (обязательно)
    - **match_date**: Дата матча (обязательно)
    - **tournament_id**, **stadium_id**, и другие поля (опционально)
    """
    # Проверка, что домашняя и гостевая команды разные
    if match.home_team_id == match.away_team_id:
        raise HTTPException(status_code=400, detail="Home team and away team cannot be the same")
    return create_match(db, match)

@router.put("/{match_id}", response_model=MatchResponse)
def update_existing_match(match_id: int, match_data: MatchUpdate, db: Session = Depends(get_db)):
    """
    Обновить информацию о матче.
    
    - **match_id**: ID матча для обновления
    - **match_data**: Данные для обновления (все поля опциональны)
    """
    db_match = update_match(db, match_id, match_data)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match

@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_match(match_id: int, db: Session = Depends(get_db)):
    """
    Удалить матч.
    
    - **match_id**: ID матча для удаления
    """
    success = delete_match(db, match_id)
    if not success:
        raise HTTPException(status_code=404, detail="Match not found")
    return None 