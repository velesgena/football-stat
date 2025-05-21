from sqlalchemy import Column, String, Boolean, Enum
import enum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class UserRole(enum.Enum):
    """Перечисление ролей пользователей"""
    user = "user"  # Обычный пользователь
    editor = "editor"  # Редактор данных
    admin = "admin"  # Администратор системы

class User(BaseModel):
    """Модель пользователя системы"""
    __tablename__ = "users"
    
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    role = Column(Enum(UserRole), default=UserRole.user)
    
    # Отношения
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    # teams = relationship("Team", back_populates="created_by")
    # matches = relationship("Match", back_populates="created_by") 