-- Create tables for Football Stats application

-- Create custom enum types
CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'finished', 'postponed', 'canceled');
CREATE TYPE tournament_type AS ENUM ('league', 'cup', 'friendly', 'playoff', 'other');
CREATE TYPE card_type AS ENUM ('yellow', 'red', 'second_yellow');
CREATE TYPE goal_type AS ENUM ('normal', 'penalty', 'own_goal', 'free_kick');

-- Base tables without foreign key dependencies

-- cities table
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    country VARCHAR NOT NULL,
    population INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_cities_name ON cities(name);
CREATE INDEX idx_cities_country ON cities(country);

-- leagues table
CREATE TABLE leagues (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    country VARCHAR NOT NULL,
    logo_url VARCHAR,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_leagues_name ON leagues(name);

-- Tables with foreign key dependencies

-- stadiums table
CREATE TABLE stadiums (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    city_id INTEGER NOT NULL REFERENCES cities(id),
    capacity INTEGER,
    address VARCHAR,
    description VARCHAR,
    photo_url VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_stadiums_name ON stadiums(name);
CREATE INDEX idx_stadiums_city_id ON stadiums(city_id);

-- tournaments table
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    league_id INTEGER REFERENCES leagues(id),
    season VARCHAR NOT NULL,
    start_date DATE,
    end_date DATE,
    type tournament_type DEFAULT 'league' NOT NULL,
    description TEXT,
    logo_url VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tournaments_name ON tournaments(name);
CREATE INDEX idx_tournaments_season ON tournaments(season);
CREATE INDEX idx_tournaments_league_id ON tournaments(league_id);

-- teams table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    city_id INTEGER REFERENCES cities(id),
    stadium_id INTEGER REFERENCES stadiums(id),
    league_id INTEGER REFERENCES leagues(id),
    country VARCHAR NOT NULL,
    logo_url VARCHAR,
    founded_year INTEGER,
    description TEXT,
    website VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_teams_city_id ON teams(city_id);
CREATE INDEX idx_teams_league_id ON teams(league_id);

-- players table
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    date_of_birth DATE,
    nationality VARCHAR NOT NULL,
    position VARCHAR NOT NULL,
    height INTEGER,
    weight INTEGER,
    team_id INTEGER REFERENCES teams(id),
    city_id INTEGER REFERENCES cities(id),
    jersey_number INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    photo_url VARCHAR,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_players_last_name ON players(last_name);
CREATE INDEX idx_players_team_id ON players(team_id);

-- matches table
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id),
    home_team_id INTEGER NOT NULL REFERENCES teams(id),
    away_team_id INTEGER NOT NULL REFERENCES teams(id),
    stadium_id INTEGER REFERENCES stadiums(id),
    match_date DATE NOT NULL,
    match_time TIMESTAMP,
    home_score INTEGER,
    away_score INTEGER,
    status match_status DEFAULT 'scheduled' NOT NULL,
    round VARCHAR,
    attendance INTEGER,
    referee VARCHAR,
    is_extra_time BOOLEAN DEFAULT FALSE,
    is_penalty BOOLEAN DEFAULT FALSE,
    home_penalty_score INTEGER,
    away_penalty_score INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_matches_match_date ON matches(match_date);
CREATE INDEX idx_matches_home_team_id ON matches(home_team_id);
CREATE INDEX idx_matches_away_team_id ON matches(away_team_id);
CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);

-- match_stats table
CREATE TABLE match_stats (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id),
    player_id INTEGER NOT NULL REFERENCES players(id),
    team_id INTEGER NOT NULL REFERENCES teams(id),
    minutes_played INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_card BOOLEAN DEFAULT FALSE,
    goal_minutes VARCHAR,
    goal_types VARCHAR,
    card_minutes VARCHAR,
    card_types VARCHAR,
    shots INTEGER DEFAULT 0,
    shots_on_target INTEGER DEFAULT 0,
    fouls_committed INTEGER DEFAULT 0,
    fouls_suffered INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    offsides INTEGER DEFAULT 0,
    corners_won INTEGER DEFAULT 0,
    is_started BOOLEAN DEFAULT FALSE,
    is_substitute BOOLEAN DEFAULT FALSE,
    substitute_in_minute INTEGER,
    substitute_out_minute INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_match_stats_match_id ON match_stats(match_id);
CREATE INDEX idx_match_stats_player_id ON match_stats(player_id);
CREATE INDEX idx_match_stats_team_id ON match_stats(team_id);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_cities_modtime
    BEFORE UPDATE ON cities
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_leagues_modtime
    BEFORE UPDATE ON leagues
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_stadiums_modtime
    BEFORE UPDATE ON stadiums
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_tournaments_modtime
    BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_teams_modtime
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_players_modtime
    BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_matches_modtime
    BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_match_stats_modtime
    BEFORE UPDATE ON match_stats
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column(); 