from typing import Optional
from pydantic import BaseModel, Field

class RefereeBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50, description="Имя судьи")
    last_name: str = Field(..., min_length=1, max_length=50, description="Фамилия судьи")
    patronymic: Optional[str] = Field(None, max_length=50, description="Отчество")
    phone: Optional[str] = Field(None, max_length=30, description="Номер телефона")
    description: Optional[str] = Field(None, description="Описание/биография")

class RefereeCreate(RefereeBase):
    pass

class RefereeUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    patronymic: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=30)
    description: Optional[str] = Field(None)

class RefereeResponse(RefereeBase):
    id: int
    class Config:
        orm_mode = True 