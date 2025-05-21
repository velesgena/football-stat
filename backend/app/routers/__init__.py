from app.routers.leagues import router as leagues_router
from app.routers.cities import router as cities_router
from app.routers.stadiums import router as stadiums_router
from app.routers.teams import router as teams_router
from app.routers.players import router as players_router
from app.routers.tournaments import router as tournaments_router
from app.routers.matches import router as matches_router
from app.routers.match_stats import router as match_stats_router
from app.routers.referees import router as referees_router
from app.routers.ws import router as ws_router
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router

routers = [
    auth_router,
    users_router,
    leagues_router,
    cities_router,
    stadiums_router,
    teams_router,
    players_router,
    tournaments_router,
    matches_router,
    match_stats_router,
    referees_router,
    ws_router,
] 