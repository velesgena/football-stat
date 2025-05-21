from typing import Optional
from pydantic import BaseModel, Field

class Token(BaseModel):
    """Схема ответа для JWT-токена"""
    access_token: str
    token_type: str = "bearer"
    
class TokenData(BaseModel):
    """Схема данных, хранящихся в JWT-токене"""
    username: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    """Схема запроса на вход в систему"""
    username: str = Field(..., description="Имя пользователя")
    password: str = Field(..., description="Пароль")
    
class LoginResponse(BaseModel):
    """Схема ответа на успешный вход в систему"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    role: str

class RefreshTokenRequest(BaseModel):
    """Схема запроса на обновление токена"""
    refresh_token: str = Field(..., description="Refresh токен")
    
class RefreshTokenResponse(BaseModel):
    """Схема ответа на запрос обновления токена"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer" 