from typing import Optional, List
from pydantic import BaseModel, Field, HttpUrl
from app.schemas.city import CityResponse
from app.schemas.stadium import StadiumResponse
from app.schemas.league import LeagueResponse

class TeamBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Название команды")
    city_id: Optional[int] = Field(None, gt=0, description="ID города")
    stadium_id: Optional[int] = Field(None, gt=0, description="ID стадиона")
    league_id: Optional[int] = Field(None, gt=0, description="ID лиги")
    logo_url: Optional[str] = Field(None, description="URL логотипа")
    founded_year: Optional[int] = Field(None, gt=1800, lt=2100, description="Год основания")
    description: Optional[str] = Field(None, description="Описание команды")
    website: Optional[str] = Field(None, description="Веб-сайт команды")
    coach: Optional[str] = Field(None, description="Тренер команды")

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Название команды")
    city_id: Optional[int] = Field(None, gt=0, description="ID города")
    stadium_id: Optional[int] = Field(None, gt=0, description="ID стадиона")
    league_id: Optional[int] = Field(None, gt=0, description="ID лиги")
    logo_url: Optional[str] = Field(None, description="URL логотипа")
    founded_year: Optional[int] = Field(None, gt=1800, lt=2100, description="Год основания")
    description: Optional[str] = Field(None, description="Описание команды")
    website: Optional[str] = Field(None, description="Веб-сайт команды")
    coach: Optional[str] = Field(None, description="Тренер команды")

class TeamResponse(TeamBase):
    id: int
    city: Optional[CityResponse] = None
    
    model_config = {"from_attributes": True}

class TeamDetailResponse(TeamResponse):
    city: Optional[CityResponse] = None
    stadium: Optional[StadiumResponse] = None
    league: Optional[LeagueResponse] = None
    
    model_config = {"from_attributes": True}

class TournamentTeamPlayerIn(BaseModel):
    player_id: int
    number: Optional[int] = None
    is_foreign: Optional[bool] = False
    is_self: Optional[bool] = False
    registered: Optional[str] = None
    unregistered: Optional[str] = None

class TournamentTeamPlayersIn(BaseModel):
    team_id: int
    players: List[TournamentTeamPlayerIn] 