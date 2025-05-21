from typing import Optional, List
from pydantic import BaseModel, Field, validator
from app.models.match_stats import CardType, GoalType
from app.schemas.player import PlayerResponse
from app.schemas.team import TeamResponse
from app.schemas.match import MatchResponse

class MatchStatsBase(BaseModel):
    match_id: int = Field(..., gt=0, description="ID матча")
    player_id: int = Field(..., gt=0, description="ID игрока")
    team_id: int = Field(..., gt=0, description="ID команды")
    
    # Основные статистики
    minutes_played: int = Field(0, ge=0, le=150, description="Сыгранные минуты")
    goals: int = Field(0, ge=0, description="Голы")
    assists: int = Field(0, ge=0, description="Передачи")
    yellow_cards: int = Field(0, ge=0, le=2, description="Желтые карточки")
    red_card: bool = Field(False, description="Красная карточка")
    
    # Детальная статистика
    goal_minutes: Optional[str] = Field(None, description="Минуты забитых голов")
    goal_types: Optional[str] = Field(None, description="Типы голов")
    card_minutes: Optional[str] = Field(None, description="Минуты полученных карточек")
    card_types: Optional[str] = Field(None, description="Типы карточек")
    
    # Дополнительная статистика
    shots: int = Field(0, ge=0, description="Удары")
    shots_on_target: int = Field(0, ge=0, description="Удары в створ")
    fouls_committed: int = Field(0, ge=0, description="Совершено фолов")
    fouls_suffered: int = Field(0, ge=0, description="Получено фолов")
    saves: int = Field(0, ge=0, description="Сейвы")
    offsides: int = Field(0, ge=0, description="Офсайды")
    corners_won: int = Field(0, ge=0, description="Выигранные угловые")
    is_started: bool = Field(False, description="Начал матч в старте")
    is_substitute: bool = Field(False, description="Вышел на замену")
    substitute_in_minute: Optional[int] = Field(None, ge=0, le=150, description="Минута выхода на замену")
    substitute_out_minute: Optional[int] = Field(None, ge=0, le=150, description="Минута ухода на замену")
    
    @validator('shots_on_target')
    def shots_on_target_cannot_exceed_shots(cls, v, values):
        if 'shots' in values and v > values['shots']:
            raise ValueError('Удары в створ не могут превышать общее количество ударов')
        return v

class MatchStatsCreate(MatchStatsBase):
    pass

class MatchStatsUpdate(BaseModel):
    match_id: Optional[int] = Field(None, gt=0, description="ID матча")
    player_id: Optional[int] = Field(None, gt=0, description="ID игрока")
    team_id: Optional[int] = Field(None, gt=0, description="ID команды")
    
    # Основные статистики
    minutes_played: Optional[int] = Field(None, ge=0, le=150, description="Сыгранные минуты")
    goals: Optional[int] = Field(None, ge=0, description="Голы")
    assists: Optional[int] = Field(None, ge=0, description="Передачи")
    yellow_cards: Optional[int] = Field(None, ge=0, le=2, description="Желтые карточки")
    red_card: Optional[bool] = Field(None, description="Красная карточка")
    
    # Детальная статистика
    goal_minutes: Optional[str] = Field(None, description="Минуты забитых голов")
    goal_types: Optional[str] = Field(None, description="Типы голов")
    card_minutes: Optional[str] = Field(None, description="Минуты полученных карточек")
    card_types: Optional[str] = Field(None, description="Типы карточек")
    
    # Дополнительная статистика
    shots: Optional[int] = Field(None, ge=0, description="Удары")
    shots_on_target: Optional[int] = Field(None, ge=0, description="Удары в створ")
    fouls_committed: Optional[int] = Field(None, ge=0, description="Совершено фолов")
    fouls_suffered: Optional[int] = Field(None, ge=0, description="Получено фолов")
    saves: Optional[int] = Field(None, ge=0, description="Сейвы")
    offsides: Optional[int] = Field(None, ge=0, description="Офсайды")
    corners_won: Optional[int] = Field(None, ge=0, description="Выигранные угловые")
    is_started: Optional[bool] = Field(None, description="Начал матч в старте")
    is_substitute: Optional[bool] = Field(None, description="Вышел на замену")
    substitute_in_minute: Optional[int] = Field(None, ge=0, le=150, description="Минута выхода на замену")
    substitute_out_minute: Optional[int] = Field(None, ge=0, le=150, description="Минута ухода на замену")
    
    @validator('shots_on_target')
    def shots_on_target_cannot_exceed_shots(cls, v, values):
        if v is not None and 'shots' in values and values['shots'] is not None and v > values['shots']:
            raise ValueError('Удары в створ не могут превышать общее количество ударов')
        return v

class MatchStatsResponse(MatchStatsBase):
    id: int
    
    model_config = {"from_attributes": True}

class MatchStatsDetailResponse(MatchStatsResponse):
    player: PlayerResponse
    team: TeamResponse
    match: MatchResponse
    
    model_config = {"from_attributes": True} 