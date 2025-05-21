from sqlalchemy import Column, Integer, ForeignKey, Boolean, String, Enum
from sqlalchemy.orm import relationship
import enum
from app.models.base import BaseModel

class CardType(str, enum.Enum):
    YELLOW = "yellow"  # Желтая карточка
    RED = "red"        # Красная карточка
    SECOND_YELLOW = "second_yellow"  # Вторая желтая (автоматически красная)

class GoalType(str, enum.Enum):
    NORMAL = "normal"          # Обычный гол
    PENALTY = "penalty"        # С пенальти
    OWN_GOAL = "own_goal"      # Автогол
    FREE_KICK = "free_kick"    # Со штрафного удара

class MatchStats(BaseModel):
    __tablename__ = "match_stats"
    
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    
    # Основные статистики
    minutes_played = Column(Integer, default=0)  # Сыгранные минуты
    goals = Column(Integer, default=0)           # Голы
    assists = Column(Integer, default=0)         # Передачи
    yellow_cards = Column(Integer, default=0)    # Желтые карточки
    red_card = Column(Boolean, default=False)    # Красная карточка
    
    # Детальная статистика по голам
    goal_minutes = Column(String, nullable=True)  # Минуты забитых голов (например "23,45,67")
    goal_types = Column(String, nullable=True)    # Типы голов (например "normal,penalty,own_goal")
    
    # Детальная статистика по карточкам
    card_minutes = Column(String, nullable=True)  # Минуты полученных карточек
    card_types = Column(String, nullable=True)    # Типы карточек
    
    # Дополнительная статистика
    shots = Column(Integer, default=0)           # Удары
    shots_on_target = Column(Integer, default=0) # Удары в створ
    fouls_committed = Column(Integer, default=0) # Совершено фолов
    fouls_suffered = Column(Integer, default=0)  # Получено фолов
    saves = Column(Integer, default=0)           # Сейвы (для вратарей)
    offsides = Column(Integer, default=0)        # Офсайды
    corners_won = Column(Integer, default=0)     # Выигранные угловые
    is_started = Column(Boolean, default=False)  # Начал матч в старте
    is_substitute = Column(Boolean, default=False)  # Вышел на замену
    substitute_in_minute = Column(Integer, nullable=True)  # Минута выхода на замену
    substitute_out_minute = Column(Integer, nullable=True)  # Минута ухода на замену
    
    # Отношения
    match = relationship("Match", back_populates="match_stats")
    player = relationship("Player", back_populates="match_stats")
    team = relationship("Team", foreign_keys=[team_id]) 