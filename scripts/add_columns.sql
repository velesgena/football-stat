-- Add missing columns to tournaments table
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS max_players INTEGER,
ADD COLUMN IF NOT EXISTS max_players_per_game INTEGER,
ADD COLUMN IF NOT EXISTS max_foreign_players INTEGER,
ADD COLUMN IF NOT EXISTS max_foreign_players_field INTEGER; 