from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import uuid

from app.models.base import BaseModel

class RefreshToken(BaseModel):
    """Модель для хранения refresh токенов"""
    __tablename__ = "refresh_tokens"
    
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    
    # Отношения
    user = relationship("User", back_populates="refresh_tokens")
    
    @classmethod
    def create_token(cls, user_id: int, expires_delta: timedelta = None):
        """Создает новый refresh токен для пользователя"""
        if expires_delta is None:
            expires_delta = timedelta(days=30)  # По умолчанию 30 дней
            
        expires_at = datetime.utcnow() + expires_delta
        token = uuid.uuid4().hex
        
        return cls(
            token=token,
            user_id=user_id,
            expires_at=expires_at
        ) 