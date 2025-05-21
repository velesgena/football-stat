from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.team import TeamCreate, TeamUpdate, TeamResponse, TeamDetailResponse
from app.crud.team import (
    get_team, get_teams, get_teams_by_league, get_teams_by_city, 
    get_teams_by_country, create_team, update_team, delete_team
)

router = APIRouter(
    prefix="/teams",
    tags=["teams"],
    responses={404: {"description": "Team not found"}},
)

@router.get("/", response_model=List[TeamResponse])
def read_teams(
    skip: int = 0, 
    limit: int = 100, 
    name: Optional[str] = None,
    league_id: Optional[int] = None,
    city_id: Optional[int] = None,
    country: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Получить список команд.
    
    - **skip**: Сколько команд пропустить (для пагинации)
    - **limit**: Максимальное количество команд для возврата
    - **name**: Фильтрация по названию команды (поиск по части имени)
    - **league_id**: Фильтрация по лиге (если указана)
    - **city_id**: Фильтрация по городу (если указан)
    - **country**: Фильтрация по стране (если указана)
    """
    if league_id:
        teams = get_teams_by_league(db, league_id, skip, limit)
    elif city_id:
        teams = get_teams_by_city(db, city_id, skip, limit)
    elif country:
        teams = get_teams_by_country(db, country, skip, limit)
    else:
        teams = get_teams(db, skip, limit)
    
    # Фильтрация по имени (если указано)
    if name and teams:
        teams = [team for team in teams if name.lower() in team.name.lower()]
    
    return teams

@router.get("/{team_id}", response_model=TeamDetailResponse)
def read_team(team_id: int, db: Session = Depends(get_db)):
    """
    Получить информацию о конкретной команде по ID.
    
    - **team_id**: ID команды
    """
    db_team = get_team(db, team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return db_team

@router.post("/", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_new_team(team: TeamCreate, db: Session = Depends(get_db)):
    """
    Создать новую команду.
    
    - **name**: Название команды (обязательно)
    - **country**: Страна (обязательно)
    - **city_id**: ID города (опционально)
    - **stadium_id**: ID стадиона (опционально)
    - **league_id**: ID лиги (опционально)
    - **logo_url**: URL логотипа (опционально)
    - **founded_year**: Год основания (опционально)
    - **description**: Описание (опционально)
    - **website**: Веб-сайт (опционально)
    """
    return create_team(db, team)

@router.put("/{team_id}", response_model=TeamResponse)
def update_existing_team(team_id: int, team_data: TeamUpdate, db: Session = Depends(get_db)):
    """
    Обновить информацию о команде.
    
    - **team_id**: ID команды для обновления
    - **team_data**: Данные для обновления (все поля опциональны)
    """
    db_team = update_team(db, team_id, team_data)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return db_team

@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_team(team_id: int, db: Session = Depends(get_db)):
    """
    Удалить команду.
    
    - **team_id**: ID команды для удаления
    """
    success = delete_team(db, team_id)
    if not success:
        raise HTTPException(status_code=404, detail="Team not found")
    return None 