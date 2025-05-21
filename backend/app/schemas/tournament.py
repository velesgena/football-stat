from typing import List, Optional, Dict
from datetime import date
from pydantic import BaseModel, Field
from app.models.tournament import TournamentType, TournamentStatus
from app.schemas.league import LeagueResponse
from .team import TournamentTeamPlayersIn

class TournamentTeamPlayerIn(BaseModel):
    player_id: int
    number: Optional[int] = None
    is_foreign: Optional[bool] = False
    is_self: Optional[bool] = False
    registered: Optional[str] = None
    unregistered: Optional[str] = None

class TournamentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Название турнира")
    league_id: Optional[int] = Field(None, gt=0, description="ID лиги")
    season: str = Field(..., min_length=1, max_length=20, description="Сезон (например, '2023-2024')")
    start_date: Optional[date] = Field(None, description="Дата начала")
    end_date: Optional[date] = Field(None, description="Дата окончания")
    type: TournamentType = Field(TournamentType.LEAGUE, description="Тип турнира")
    status: TournamentStatus = Field(TournamentStatus.PLANNED, description="Статус турнира")
    description: Optional[str] = Field(None, description="Описание турнира")
    logo_url: Optional[str] = Field(None, description="URL логотипа")
    rounds_count: int = Field(1, description="Количество кругов")
    format: Optional[str] = Field(None, description="Формат турнира (11х11, 8х8, 5х5)")
    max_players: Optional[int] = Field(None, description="Максимальное количество человек в общей заявке")
    max_players_per_game: Optional[int] = Field(None, description="Максимальное количество человек на игру")
    max_foreign_players: Optional[int] = Field(None, description="Максимальное количество легионеров")
    max_foreign_players_field: Optional[int] = Field(None, description="Максимальное количество легионеров в поле")
    tour_dates: Optional[Dict[str, str]] = None  # Key: tour number (str), Value: date (str)

class TournamentCreate(TournamentBase):
    teams: Optional[List[TournamentTeamPlayersIn]] = []

class TournamentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Название турнира")
    league_id: Optional[int] = Field(None, gt=0, description="ID лиги")
    season: Optional[str] = Field(None, min_length=1, max_length=20, description="Сезон (например, '2023-2024')")
    start_date: Optional[date] = Field(None, description="Дата начала")
    end_date: Optional[date] = Field(None, description="Дата окончания")
    type: Optional[TournamentType] = Field(None, description="Тип турнира")
    status: Optional[TournamentStatus] = Field(None, description="Статус турнира")
    description: Optional[str] = Field(None, description="Описание турнира")
    logo_url: Optional[str] = Field(None, description="URL логотипа")
    teams: Optional[List[TournamentTeamPlayersIn]] = []
    rounds_count: Optional[int] = Field(1, description="Количество кругов")
    format: Optional[str] = Field(None, description="Формат турнира (11х11, 8х8, 5х5)")
    max_players: Optional[int] = Field(None, description="Максимальное количество человек в общей заявке")
    max_players_per_game: Optional[int] = Field(None, description="Максимальное количество человек на игру")
    max_foreign_players: Optional[int] = Field(None, description="Максимальное количество легионеров")
    max_foreign_players_field: Optional[int] = Field(None, description="Максимальное количество легионеров в поле")
    tour_dates: Optional[Dict[str, str]] = None  # Key: tour number (str), Value: date (str)

class TournamentTeamPlayerOut(BaseModel):
    player_id: int
    number: Optional[int] = None
    is_foreign: Optional[bool] = False
    is_self: Optional[bool] = False
    registered: Optional[str] = None
    unregistered: Optional[str] = None

class TournamentTeamPlayersOut(BaseModel):
    team_id: int
    players: List[TournamentTeamPlayerOut]

class TournamentResponse(TournamentBase):
    id: int
    teams: List[TournamentTeamPlayersOut] = []
    model_config = {"from_attributes": True}

class TournamentDetailResponse(TournamentResponse):
    league: Optional[LeagueResponse] = None
    model_config = {"from_attributes": True} 