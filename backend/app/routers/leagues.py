from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.league import LeagueCreate, LeagueUpdate, LeagueResponse
from app.crud.league import get_league, get_leagues, get_leagues_by_country, create_league, update_league, delete_league

router = APIRouter(
    prefix="/leagues",
    tags=["leagues"],
    responses={404: {"description": "League not found"}},
)

@router.get("/", response_model=List[LeagueResponse])
def read_leagues(
    skip: int = 0, 
    limit: int = 100, 
    country: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Получить список лиг.
    
    - **skip**: Сколько лиг пропустить (для пагинации)
    - **limit**: Максимальное количество лиг для возврата
    - **country**: Фильтрация по стране (если указана)
    """
    if country:
        leagues = get_leagues_by_country(db, country, skip, limit)
    else:
        leagues = get_leagues(db, skip, limit)
    return leagues

@router.get("/{league_id}", response_model=LeagueResponse)
def read_league(league_id: int, db: Session = Depends(get_db)):
    """
    Получить информацию о конкретной лиге по ID.
    
    - **league_id**: ID лиги
    """
    db_league = get_league(db, league_id)
    if db_league is None:
        raise HTTPException(status_code=404, detail="League not found")
    return db_league

@router.post("/", response_model=LeagueResponse, status_code=status.HTTP_201_CREATED)
def create_new_league(league: LeagueCreate, db: Session = Depends(get_db)):
    """
    Создать новую лигу.
    
    - **name**: Название лиги (обязательно)
    - **country**: Страна лиги (обязательно)
    - **logo_url**: URL логотипа лиги (опционально)
    - **description**: Описание лиги (опционально)
    """
    return create_league(db, league)

@router.put("/{league_id}", response_model=LeagueResponse)
def update_existing_league(league_id: int, league_data: LeagueUpdate, db: Session = Depends(get_db)):
    """
    Обновить информацию о лиге.
    
    - **league_id**: ID лиги для обновления
    - **league_data**: Данные для обновления (все поля опциональны)
    """
    db_league = update_league(db, league_id, league_data)
    if db_league is None:
        raise HTTPException(status_code=404, detail="League not found")
    return db_league

@router.delete("/{league_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_league(league_id: int, db: Session = Depends(get_db)):
    """
    Удалить лигу.
    
    - **league_id**: ID лиги для удаления
    """
    success = delete_league(db, league_id)
    if not success:
        raise HTTPException(status_code=404, detail="League not found")
    return None 