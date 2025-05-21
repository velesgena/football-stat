from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field, validator
from app.models.match import MatchStatus
from app.schemas.team import TeamResponse
from app.schemas.stadium import StadiumResponse
from app.schemas.tournament import TournamentResponse
from app.schemas.referee import RefereeResponse

class MatchBase(BaseModel):
    tournament_id: Optional[int] = Field(None, gt=0, description="ID турнира")
    home_team_id: int = Field(..., gt=0, description="ID домашней команды")
    away_team_id: int = Field(..., gt=0, description="ID гостевой команды")
    stadium_id: Optional[int] = Field(None, gt=0, description="ID стадиона")
    match_date: date = Field(..., description="Дата матча")
    match_time: Optional[datetime] = Field(None, description="Время матча")
    home_score: Optional[int] = Field(None, ge=0, description="Голы домашней команды")
    away_score: Optional[int] = Field(None, ge=0, description="Голы гостевой команды")
    status: MatchStatus = Field(MatchStatus.SCHEDULED, description="Статус матча")
    round: Optional[str] = Field(None, description="Раунд или тур")
    attendance: Optional[int] = Field(None, ge=0, description="Количество зрителей")
    referee_id: Optional[int] = Field(None, description="ID судьи")
    is_extra_time: Optional[bool] = Field(False, description="Было ли дополнительное время")
    is_penalty: Optional[bool] = Field(False, description="Была ли серия пенальти")
    home_penalty_score: Optional[int] = Field(None, ge=0, description="Счет пенальти дома")
    away_penalty_score: Optional[int] = Field(None, ge=0, description="Счет пенальти в гостях")
    notes: Optional[str] = Field(None, description="Дополнительные заметки")
    
    @validator('away_team_id')
    def teams_cannot_be_same(cls, v, values):
        if 'home_team_id' in values and v == values['home_team_id']:
            raise ValueError('Домашняя и гостевая команды не могут быть одинаковыми')
        return v

class MatchCreate(MatchBase):
    pass

class MatchUpdate(BaseModel):
    tournament_id: Optional[int] = Field(None, gt=0, description="ID турнира")
    home_team_id: Optional[int] = Field(None, gt=0, description="ID домашней команды")
    away_team_id: Optional[int] = Field(None, gt=0, description="ID гостевой команды")
    stadium_id: Optional[int] = Field(None, gt=0, description="ID стадиона")
    match_date: Optional[date] = Field(None, description="Дата матча")
    match_time: Optional[datetime] = Field(None, description="Время матча")
    home_score: Optional[int] = Field(None, ge=0, description="Голы домашней команды")
    away_score: Optional[int] = Field(None, ge=0, description="Голы гостевой команды")
    status: Optional[MatchStatus] = Field(None, description="Статус матча")
    round: Optional[str] = Field(None, description="Раунд или тур")
    attendance: Optional[int] = Field(None, ge=0, description="Количество зрителей")
    referee_id: Optional[int] = Field(None, description="ID судьи")
    is_extra_time: Optional[bool] = Field(None, description="Было ли дополнительное время")
    is_penalty: Optional[bool] = Field(None, description="Была ли серия пенальти")
    home_penalty_score: Optional[int] = Field(None, ge=0, description="Счет пенальти дома")
    away_penalty_score: Optional[int] = Field(None, ge=0, description="Счет пенальти в гостях")
    notes: Optional[str] = Field(None, description="Дополнительные заметки")
    
    @validator('away_team_id')
    def teams_cannot_be_same(cls, v, values):
        if v is not None and 'home_team_id' in values and values['home_team_id'] is not None and v == values['home_team_id']:
            raise ValueError('Домашняя и гостевая команды не могут быть одинаковыми')
        return v

class MatchResponse(MatchBase):
    id: int
    referee: Optional[RefereeResponse] = None
    stadium: Optional[StadiumResponse] = None
    home_team: TeamResponse
    away_team: TeamResponse
    tournament: Optional[TournamentResponse] = None
    
    model_config = {"from_attributes": True}

class MatchDetailResponse(MatchResponse):
    home_team: TeamResponse
    away_team: TeamResponse
    stadium: Optional[StadiumResponse] = None
    tournament: Optional[TournamentResponse] = None
    referee: Optional[RefereeResponse] = None
    
    model_config = {"from_attributes": True} 