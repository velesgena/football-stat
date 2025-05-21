from app.database import engine
from app.models.base import BaseModel
from app.models.city import City
from app.models.team import Team
from app.models.player import Player
from app.models.stadium import Stadium
from app.models.league import League
from app.models.tournament import Tournament
from app.models.match import Match

# Создаем все таблицы
print("Creating database tables...")
BaseModel.metadata.create_all(bind=engine)
print("Database tables created successfully!") 