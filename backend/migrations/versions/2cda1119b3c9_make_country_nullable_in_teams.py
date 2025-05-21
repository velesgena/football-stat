"""make country nullable in teams

Revision ID: 2cda1119b3c9
Revises: 464332b3a380
Create Date: 2025-05-17 20:45:52.267977

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2cda1119b3c9'
down_revision = '464332b3a380'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column('teams', 'country', existing_type=sa.String(), nullable=True)


def downgrade() -> None:
    op.alter_column('teams', 'country', existing_type=sa.String(), nullable=False) 