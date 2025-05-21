from sqlalchemy import Column, String, Integer, ForeignKey, Text, Date, Enum, Table, UniqueConstraint, Boolean, JSON
from sqlalchemy.orm import relationship
import enum
from app.models.base import BaseModel

class TournamentType(str, enum.Enum):
    LEAGUE = "league"       # Чемпионат
    CUP = "cup"             # Кубок
    FRIENDLY = "friendly"   # Товарищеский
    PLAYOFF = "playoff"     # Плей-офф
    OTHER = "other"         # Другое

class TournamentStatus(str, enum.Enum):
    PLANNED = "planned"     # Запланирован
    ACTIVE = "active"       # Активный
    COMPLETED = "completed" # Завершен

class Tournament(BaseModel):
    __tablename__ = "tournaments"
    
    name = Column(String, nullable=False, index=True)
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=True)
    season = Column(String, nullable=False, index=True)  # например, "2023-2024"
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    type = Column(Enum(TournamentType), default=TournamentType.LEAGUE, nullable=False)
    status = Column(Enum(TournamentStatus), default=TournamentStatus.PLANNED, nullable=False)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    rounds_count = Column(Integer, nullable=False, default=1)
    format = Column(String, nullable=True)  # Добавляем поле формата (11х11, 8х8, 5х5)
    
    # Дополнительные настройки турнира
    max_players = Column(Integer, nullable=True)  # Максимальное количество человек в общей заявке
    max_players_per_game = Column(Integer, nullable=True)  # Максимальное количество человек на игру
    max_foreign_players = Column(Integer, nullable=True)  # Максимальное количество легионеров
    max_foreign_players_field = Column(Integer, nullable=True)  # Максимальное количество легионеров в поле
    tour_dates = Column(JSON, nullable=True)  # Даты проведения туров в формате {tour_number: date}
    
    # Отношения
    league = relationship("League", back_populates="tournaments")
    matches = relationship("Match", back_populates="tournament", cascade="all, delete-orphan")

class TournamentTeam(BaseModel):
    __tablename__ = "tournament_teams"
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    __table_args__ = (UniqueConstraint('tournament_id', 'team_id', name='_tournament_team_uc'),)

class TournamentTeamPlayer(BaseModel):
    __tablename__ = "tournament_team_players"
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    number = Column(Integer, nullable=True)
    is_foreign = Column(Boolean, default=False)
    is_self = Column(Boolean, default=False)
    registered = Column(String, nullable=True)  # 'all' или 'from_2'
    unregistered = Column(String, nullable=True)  # 'all' или 'after_1'
    __table_args__ = (UniqueConstraint('tournament_id', 'team_id', 'player_id', name='_tournament_team_player_uc'),) 