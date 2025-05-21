from sqlalchemy import Column, Integer, Boolean, ForeignKey, UniqueConstraint
from app.models.base import BaseModel

class PlayerLeagueStatus(BaseModel):
    __tablename__ = "player_league_statuses"
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=False)
    is_foreign = Column(Boolean, default=False, nullable=False)
    is_self = Column(Boolean, default=False, nullable=False)

    __table_args__ = (UniqueConstraint('player_id', 'league_id', name='_player_league_uc'),) 