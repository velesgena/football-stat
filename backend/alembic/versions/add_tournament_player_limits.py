"""add tournament player limits

Revision ID: add_tournament_player_limits
Revises: add_coach_to_teams
Create Date: 2023-10-19 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_tournament_player_limits'
down_revision = 'add_coach_to_teams'
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns to the tournaments table
    op.add_column('tournaments', sa.Column('max_players', sa.Integer(), nullable=True))
    op.add_column('tournaments', sa.Column('max_players_per_game', sa.Integer(), nullable=True))
    op.add_column('tournaments', sa.Column('max_foreign_players', sa.Integer(), nullable=True))
    op.add_column('tournaments', sa.Column('max_foreign_players_field', sa.Integer(), nullable=True))

def downgrade():
    # Remove the columns added in the upgrade
    op.drop_column('tournaments', 'max_players')
    op.drop_column('tournaments', 'max_players_per_game')
    op.drop_column('tournaments', 'max_foreign_players')
    op.drop_column('tournaments', 'max_foreign_players_field') 