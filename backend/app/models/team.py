from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Team(BaseModel):
    __tablename__ = "teams"
    
    name = Column(String, index=True, nullable=False)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=True)
    stadium_id = Column(Integer, ForeignKey("stadiums.id"), nullable=True)
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=True)
    logo_url = Column(String, nullable=True)
    founded_year = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    coach = Column(String, nullable=True)
    
    # Отношения
    city = relationship("City", back_populates="teams")
    stadium = relationship("Stadium", back_populates="teams")
    league = relationship("League", back_populates="teams")
    players = relationship("Player", back_populates="team", cascade="all, delete-orphan")
    home_matches = relationship(
        "Match", 
        foreign_keys="Match.home_team_id", 
        back_populates="home_team", 
        cascade="all, delete"
    )
    away_matches = relationship(
        "Match", 
        foreign_keys="Match.away_team_id", 
        back_populates="away_team", 
        cascade="all, delete"
    ) 