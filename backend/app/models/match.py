from sqlalchemy import Column, String, Integer, ForeignKey, Text, Date, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
import enum
from app.models.base import BaseModel
from app.models.referee import Referee

class MatchStatus(str, enum.Enum):
    SCHEDULED = "scheduled"    # Запланирован
    LIVE = "live"              # Идет сейчас
    FINISHED = "finished"      # Завершен
    POSTPONED = "postponed"    # Отложен
    CANCELED = "canceled"      # Отменен

class Match(BaseModel):
    __tablename__ = "matches"
    
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=True)
    home_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    away_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    stadium_id = Column(Integer, ForeignKey("stadiums.id"), nullable=True)
    match_date = Column(Date, nullable=False, index=True)
    match_time = Column(DateTime, nullable=True)
    home_score = Column(Integer, nullable=True)
    away_score = Column(Integer, nullable=True)
    status = Column(Enum(MatchStatus), default=MatchStatus.SCHEDULED, nullable=False)
    round = Column(String, nullable=True)  # Например: "1", "2", "Final", "Semi-final"
    attendance = Column(Integer, nullable=True)  # Кол-во зрителей
    referee_id = Column(Integer, ForeignKey("referees.id"), nullable=True)
    is_extra_time = Column(Boolean, default=False)  # Было ли дополнительное время
    is_penalty = Column(Boolean, default=False)  # Была ли серия пенальти
    home_penalty_score = Column(Integer, nullable=True)  # Счет пенальти дома
    away_penalty_score = Column(Integer, nullable=True)  # Счет пенальти в гостях
    notes = Column(Text, nullable=True)  # Дополнительные заметки
    
    # Отношения
    tournament = relationship("Tournament", back_populates="matches")
    home_team = relationship("Team", foreign_keys=[home_team_id], back_populates="home_matches")
    away_team = relationship("Team", foreign_keys=[away_team_id], back_populates="away_matches")
    stadium = relationship("Stadium", back_populates="matches")
    referee = relationship("Referee", back_populates="matches")
    match_stats = relationship("MatchStats", back_populates="match", cascade="all, delete-orphan") 