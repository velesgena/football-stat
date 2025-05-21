from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator
from app.models.user import UserRole

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Имя пользователя")
    email: EmailStr = Field(..., description="Электронная почта")
    full_name: Optional[str] = Field(None, min_length=1, max_length=100, description="Полное имя")
    is_active: Optional[bool] = Field(True, description="Активен ли аккаунт")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Пароль (не хешированный)")
    
    @validator('password')
    def password_complexity(cls, v):
        """Проверка сложности пароля"""
        if len(v) < 8:
            raise ValueError('Пароль должен быть не менее 8 символов')
        
        # Проверка наличия цифр
        if not any(char.isdigit() for char in v):
            raise ValueError('Пароль должен содержать хотя бы одну цифру')
        
        # Проверка наличия букв
        if not any(char.isalpha() for char in v):
            raise ValueError('Пароль должен содержать хотя бы одну букву')
        
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8)
    
    @validator('password')
    def password_complexity(cls, v):
        """Проверка сложности пароля"""
        if v is None:
            return v
            
        if len(v) < 8:
            raise ValueError('Пароль должен быть не менее 8 символов')
        
        # Проверка наличия цифр
        if not any(char.isdigit() for char in v):
            raise ValueError('Пароль должен содержать хотя бы одну цифру')
        
        # Проверка наличия букв
        if not any(char.isalpha() for char in v):
            raise ValueError('Пароль должен содержать хотя бы одну букву')
        
        return v

class UserResponse(UserBase):
    id: int
    role: UserRole
    
    model_config = {"from_attributes": True}

class UserInDB(UserResponse):
    hashed_password: str
    
    model_config = {"from_attributes": True} 