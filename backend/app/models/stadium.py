from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Stadium(BaseModel):
    __tablename__ = "stadiums"
    
    name = Column(String, nullable=False, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    capacity = Column(Integer, nullable=True)
    address = Column(String, nullable=True)
    description = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    
    # Отношения
    city = relationship("City", back_populates="stadiums")
    teams = relationship("Team", back_populates="stadium", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="stadium", cascade="all, delete-orphan") 