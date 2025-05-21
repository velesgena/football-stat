from typing import Optional
from pydantic import BaseModel, HttpUrl, Field

class LeagueBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Название лиги")
    country: str = Field(..., min_length=1, max_length=100, description="Страна лиги")
    logo_url: Optional[str] = Field(None, description="URL логотипа лиги")
    description: Optional[str] = Field(None, description="Описание лиги")

class LeagueCreate(LeagueBase):
    pass

class LeagueUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Название лиги")
    country: Optional[str] = Field(None, min_length=1, max_length=100, description="Страна лиги")
    logo_url: Optional[str] = Field(None, description="URL логотипа лиги")
    description: Optional[str] = Field(None, description="Описание лиги")

class LeagueResponse(LeagueBase):
    id: int
    
    model_config = {"from_attributes": True} 