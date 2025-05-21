from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.match_stats import MatchStatsCreate, MatchStatsUpdate, MatchStatsResponse, MatchStatsDetailResponse
from app.crud.match_stats import (
    get_match_stats, get_all_match_stats, get_match_stats_by_match, get_match_stats_by_player,
    get_match_stats_by_team, get_match_stats_by_match_and_player, get_match_stats_by_match_and_team,
    create_match_stats, update_match_stats, delete_match_stats, delete_match_stats_by_match
)

router = APIRouter(
    prefix="/match-stats",
    tags=["match-stats"],
    responses={404: {"description": "Match stats not found"}},
)

@router.get("/", response_model=List[MatchStatsResponse])
def read_match_stats(
    skip: int = 0, 
    limit: int = 100, 
    match_id: Optional[int] = None,
    player_id: Optional[int] = None,
    team_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Получить список статистики матчей.
    
    - **skip**: Сколько записей пропустить (для пагинации)
    - **limit**: Максимальное количество записей для возврата
    - **match_id**: Фильтрация по матчу (если указан)
    - **player_id**: Фильтрация по игроку (если указан)
    - **team_id**: Фильтрация по команде (если указана)
    """
    if match_id and player_id:
        stat = get_match_stats_by_match_and_player(db, match_id, player_id)
        return [stat] if stat else []
    elif match_id and team_id:
        return get_match_stats_by_match_and_team(db, match_id, team_id)
    elif match_id:
        return get_match_stats_by_match(db, match_id, skip, limit)
    elif player_id:
        return get_match_stats_by_player(db, player_id, skip, limit)
    elif team_id:
        return get_match_stats_by_team(db, team_id, skip, limit)
    else:
        return get_all_match_stats(db, skip, limit)

@router.get("/{match_stats_id}", response_model=MatchStatsDetailResponse)
def read_match_stat(match_stats_id: int, db: Session = Depends(get_db)):
    """
    Получить информацию о конкретной статистике матча по ID.
    
    - **match_stats_id**: ID статистики матча
    """
    db_match_stats = get_match_stats(db, match_stats_id)
    if db_match_stats is None:
        raise HTTPException(status_code=404, detail="Match stats not found")
    return db_match_stats

@router.post("/", response_model=MatchStatsResponse, status_code=status.HTTP_201_CREATED)
def create_new_match_stats(match_stats: MatchStatsCreate, db: Session = Depends(get_db)):
    """
    Создать новую статистику матча.
    
    - **match_id**: ID матча (обязательно)
    - **player_id**: ID игрока (обязательно)
    - **team_id**: ID команды (обязательно)
    - Другие поля статистики (опционально)
    """
    # Проверяем, существует ли уже статистика для этого игрока в этом матче
    existing_stats = get_match_stats_by_match_and_player(db, match_stats.match_id, match_stats.player_id)
    if existing_stats:
        raise HTTPException(
            status_code=400, 
            detail=f"Stats for player {match_stats.player_id} in match {match_stats.match_id} already exists"
        )
    return create_match_stats(db, match_stats)

@router.put("/{match_stats_id}", response_model=MatchStatsResponse)
def update_existing_match_stats(match_stats_id: int, match_stats_data: MatchStatsUpdate, db: Session = Depends(get_db)):
    """
    Обновить статистику матча.
    
    - **match_stats_id**: ID статистики матча для обновления
    - **match_stats_data**: Данные для обновления (все поля опциональны)
    """
    db_match_stats = update_match_stats(db, match_stats_id, match_stats_data)
    if db_match_stats is None:
        raise HTTPException(status_code=404, detail="Match stats not found")
    return db_match_stats

@router.delete("/{match_stats_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_match_stats(match_stats_id: int, db: Session = Depends(get_db)):
    """
    Удалить статистику матча.
    
    - **match_stats_id**: ID статистики матча для удаления
    """
    success = delete_match_stats(db, match_stats_id)
    if not success:
        raise HTTPException(status_code=404, detail="Match stats not found")
    return None

@router.delete("/match/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_match_stats_for_match(match_id: int, db: Session = Depends(get_db)):
    """
    Удалить всю статистику для указанного матча.
    
    - **match_id**: ID матча
    """
    count = delete_match_stats_by_match(db, match_id)
    if count == 0:
        raise HTTPException(status_code=404, detail="No match stats found for this match")
    return None 