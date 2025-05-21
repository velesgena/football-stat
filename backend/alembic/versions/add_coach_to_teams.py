"""add coach to teams\n\nRevision ID: add_coach_to_teams\nRevises: <last_revision_id>\nCreate Date: 2024-05-17\n"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('teams', sa.Column('coach', sa.String(), nullable=True))

def downgrade():
    op.drop_column('teams', 'coach') 