from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class League(BaseModel):
    __tablename__ = "leagues"
    
    name = Column(String, index=True, nullable=False)
    country = Column(String, nullable=False)
    logo_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    
    # Отношения
    teams = relationship("Team", back_populates="league")
    tournaments = relationship("Tournament", back_populates="league", cascade="all, delete-orphan") 