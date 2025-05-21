from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.tournament import Tournament, TournamentType, TournamentTeam, TournamentTeamPlayer
from app.schemas.tournament import TournamentCreate, TournamentUpdate

def get_tournament(db: Session, tournament_id: int) -> Optional[Tournament]:
    """Получение турнира по ID"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        return None
    # Получаем команды и составы
    teams = db.query(TournamentTeam).filter(TournamentTeam.tournament_id == tournament_id).all()
    team_players = db.query(TournamentTeamPlayer).filter(TournamentTeamPlayer.tournament_id == tournament_id).all()
    tournament.teams = []
    for t in teams:
        players = [
            {
                "player_id": tp.player_id,
                "number": tp.number,
                "is_foreign": tp.is_foreign,
                "is_self": tp.is_self,
                "registered": tp.registered,
                "unregistered": tp.unregistered
            }
            for tp in team_players if tp.team_id == t.team_id
        ]
        tournament.teams.append({"team_id": t.team_id, "players": players})
    return tournament

def get_tournaments(db: Session, skip: int = 0, limit: int = 100) -> List[Tournament]:
    """Получение списка турниров с пагинацией"""
    tournaments = db.query(Tournament).offset(skip).limit(limit).all()
    for tournament in tournaments:
        teams = db.query(TournamentTeam).filter(TournamentTeam.tournament_id == tournament.id).all()
        team_players = db.query(TournamentTeamPlayer).filter(TournamentTeamPlayer.tournament_id == tournament.id).all()
        tournament.teams = []
        for t in teams:
            players = [
                {
                    "player_id": tp.player_id,
                    "number": tp.number,
                    "is_foreign": tp.is_foreign,
                    "is_self": tp.is_self,
                    "registered": tp.registered,
                    "unregistered": tp.unregistered
                }
                for tp in team_players if tp.team_id == t.team_id
            ]
            tournament.teams.append({"team_id": t.team_id, "players": players})
    return tournaments

def get_tournaments_by_league(db: Session, league_id: int, skip: int = 0, limit: int = 100) -> List[Tournament]:
    """Получение турниров по лиге"""
    return db.query(Tournament).filter(Tournament.league_id == league_id).offset(skip).limit(limit).all()

def get_tournaments_by_season(db: Session, season: str, skip: int = 0, limit: int = 100) -> List[Tournament]:
    """Получение турниров по сезону"""
    return db.query(Tournament).filter(Tournament.season == season).offset(skip).limit(limit).all()

def get_tournaments_by_type(db: Session, tournament_type: TournamentType, skip: int = 0, limit: int = 100) -> List[Tournament]:
    """Получение турниров по типу"""
    return db.query(Tournament).filter(Tournament.type == tournament_type).offset(skip).limit(limit).all()

def create_tournament(db: Session, tournament: TournamentCreate) -> Tournament:
    """Создание нового турнира"""
    teams_data = tournament.teams or []
    t_data = tournament.dict(exclude={"teams"})
    db_tournament = Tournament(**t_data)
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    # Добавляем команды и игроков
    for team in teams_data:
        db_team = TournamentTeam(tournament_id=db_tournament.id, team_id=team.team_id)
        db.add(db_team)
        for player in team.players:
            db_player = TournamentTeamPlayer(
                tournament_id=db_tournament.id,
                team_id=team.team_id,
                player_id=player.player_id,
                number=player.number,
                is_foreign=player.is_foreign,
                is_self=player.is_self,
                registered=player.registered,
                unregistered=player.unregistered
            )
            db.add(db_player)
    db.commit()
    return get_tournament(db, db_tournament.id)

def update_tournament(db: Session, tournament_id: int, tournament_data: TournamentUpdate) -> Optional[Tournament]:
    """Обновление данных турнира"""
    db_tournament = get_tournament(db, tournament_id)
    if db_tournament:
        update_data = tournament_data.dict(exclude_unset=True, exclude={"teams"})
        for key, value in update_data.items():
            setattr(db_tournament, key, value)
        db.commit()
        # Обновляем команды и игроков, если переданы
        if tournament_data.teams is not None:
            db.query(TournamentTeam).filter(TournamentTeam.tournament_id == tournament_id).delete()
            db.query(TournamentTeamPlayer).filter(TournamentTeamPlayer.tournament_id == tournament_id).delete()
            for team in tournament_data.teams:
                db_team = TournamentTeam(tournament_id=tournament_id, team_id=team.team_id)
                db.add(db_team)
                for player in team.players:
                    db_player = TournamentTeamPlayer(
                        tournament_id=tournament_id,
                        team_id=team.team_id,
                        player_id=player.player_id,
                        number=player.number,
                        is_foreign=player.is_foreign,
                        is_self=player.is_self,
                        registered=player.registered,
                        unregistered=player.unregistered
                    )
                    db.add(db_player)
            db.commit()
        return get_tournament(db, tournament_id)
    return None

def delete_tournament(db: Session, tournament_id: int) -> bool:
    """Удаление турнира"""
    db_tournament = get_tournament(db, tournament_id)
    if db_tournament:
        db.delete(db_tournament)
        db.commit()
        return True
    return False 