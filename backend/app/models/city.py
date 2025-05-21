from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class City(BaseModel):
    __tablename__ = "cities"
    
    name = Column(String, nullable=False, index=True)
    country = Column(String, nullable=False, index=True)
    population = Column(Integer, nullable=True)
    
    # Отношения (будут определены позже)
    teams = relationship("Team", back_populates="city", cascade="all, delete-orphan")
    stadiums = relationship("Stadium", back_populates="city", cascade="all, delete-orphan")
    players = relationship("Player", back_populates="city", cascade="all, delete-orphan") 