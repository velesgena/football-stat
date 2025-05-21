from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field, validator
from app.schemas.team import TeamResponse
from app.schemas.city import CityResponse

class PlayerBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50, description="Имя игрока")
    last_name: str = Field(..., min_length=1, max_length=50, description="Фамилия игрока")
    patronymic: Optional[str] = Field(None, max_length=50, description="Отчество")
    date_of_birth: Optional[date] = Field(None, description="Дата рождения")
    position: Optional[str] = Field(None, max_length=50, description="Позиция игрока")
    phone: Optional[str] = Field(None, max_length=30, description="Номер телефона")
    height: Optional[int] = Field(None, ge=140, le=230, description="Рост в сантиметрах")
    weight: Optional[int] = Field(None, ge=40, le=150, description="Вес в килограммах")
    team_id: Optional[int] = Field(None, gt=0, description="ID команды")
    city_id: Optional[int] = Field(None, gt=0, description="ID города")
    jersey_number: Optional[int] = Field(None, ge=1, le=99, description="Номер на футболке")
    is_active: Optional[bool] = Field(True, description="Активен ли игрок")
    photo_url: Optional[str] = Field(None, description="URL фотографии")
    description: Optional[str] = Field(None, description="Описание/биография")

class PlayerCreate(PlayerBase):
    pass

class PlayerUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50, description="Имя игрока")
    last_name: Optional[str] = Field(None, min_length=1, max_length=50, description="Фамилия игрока")
    patronymic: Optional[str] = Field(None, max_length=50, description="Отчество")
    date_of_birth: Optional[date] = Field(None, description="Дата рождения")
    position: Optional[str] = Field(None, max_length=50, description="Позиция игрока")
    phone: Optional[str] = Field(None, max_length=30, description="Номер телефона")
    height: Optional[int] = Field(None, ge=140, le=230, description="Рост в сантиметрах")
    weight: Optional[int] = Field(None, ge=40, le=150, description="Вес в килограммах")
    team_id: Optional[int] = Field(None, gt=0, description="ID команды")
    city_id: Optional[int] = Field(None, gt=0, description="ID города")
    jersey_number: Optional[int] = Field(None, ge=1, le=99, description="Номер на футболке")
    is_active: Optional[bool] = Field(None, description="Активен ли игрок")
    photo_url: Optional[str] = Field(None, description="URL фотографии")
    description: Optional[str] = Field(None, description="Описание/биография")

class PlayerResponse(PlayerBase):
    id: int
    
    model_config = {"from_attributes": True}

class PlayerLeagueStatusBase(BaseModel):
    league_id: int
    is_foreign: bool = False
    is_self: bool = False

class PlayerLeagueStatusCreate(PlayerLeagueStatusBase):
    pass

class PlayerLeagueStatusUpdate(BaseModel):
    is_foreign: Optional[bool] = None
    is_self: Optional[bool] = None

class PlayerLeagueStatusResponse(PlayerLeagueStatusBase):
    id: int
    class Config:
        orm_mode = True

class PlayerDetailResponse(PlayerResponse):
    team: Optional[TeamResponse] = None
    city: Optional[CityResponse] = None
    leagues_statuses: List[PlayerLeagueStatusResponse] = []
    
    model_config = {"from_attributes": True} 