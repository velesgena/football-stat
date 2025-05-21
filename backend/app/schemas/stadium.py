from typing import Optional, ClassVar
from pydantic import BaseModel, Field
from app.schemas.city import CityResponse

class StadiumBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Название стадиона")
    city_id: int = Field(..., gt=0, description="ID населенного пункта")
    capacity: Optional[int] = Field(None, ge=0, description="Вместимость")
    address: Optional[str] = Field(None, max_length=200, description="Адрес")
    description: Optional[str] = Field(None, description="Описание")
    photo_url: Optional[str] = Field(None, description="URL фотографии")

class StadiumCreate(StadiumBase):
    pass

class StadiumUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Название стадиона")
    city_id: Optional[int] = Field(None, gt=0, description="ID населенного пункта")
    capacity: Optional[int] = Field(None, ge=0, description="Вместимость")
    address: Optional[str] = Field(None, max_length=200, description="Адрес")
    description: Optional[str] = Field(None, description="Описание")
    photo_url: Optional[str] = Field(None, description="URL фотографии")

class StadiumResponse(StadiumBase):
    id: int
    city: Optional[CityResponse]
    
    model_config = {"from_attributes": True} 