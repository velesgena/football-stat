from typing import Optional
from pydantic import BaseModel, Field, validator

class CityBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Название населенного пункта")
    country: str = Field(..., min_length=1, max_length=100, description="Страна")
    population: Optional[int] = Field(None, ge=0, description="Население")

    @validator('name')
    def name_strip(cls, v):
        return v.strip()

    @validator('country')
    def country_strip(cls, v):
        return v.strip()

class CityCreate(CityBase):
    pass

class CityUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Название населенного пункта")
    country: Optional[str] = Field(None, min_length=1, max_length=100, description="Страна")
    population: Optional[int] = Field(None, ge=0, description="Население")

class CityResponse(CityBase):
    id: int
    model_config = {"from_attributes": True} 