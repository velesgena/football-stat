from sqlalchemy import Column, String, Integer, ForeignKey, Date, Boolean, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Player(BaseModel):
    __tablename__ = "players"
    
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False, index=True)
    date_of_birth = Column(Date, nullable=True)
    # nationality = Column(String, nullable=False)  # Удалено поле гражданство
    position = Column(String, nullable=False)
    height = Column(Integer, nullable=True)  # в сантиметрах
    weight = Column(Integer, nullable=True)  # в килограммах
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=True)  # город рождения/проживания
    jersey_number = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    photo_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    patronymic = Column(String, nullable=True)  # Отчество
    phone = Column(String, nullable=True)  # Номер телефона
    
    # Отношения
    team = relationship("Team", back_populates="players")
    city = relationship("City", back_populates="players")
    match_stats = relationship("MatchStats", back_populates="player", cascade="all, delete-orphan") 