"""add status to tournaments

Revision ID: c4e7cf7b8a59
Revises: 5a6724c9eea8
Create Date: 2024-03-24 14:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c4e7cf7b8a59'
down_revision: Union[str, None] = '5a6724c9eea8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Создаем тип enum перед его использованием
    op.execute("CREATE TYPE tournamentstatus AS ENUM ('planned', 'active', 'completed')")
    
    # Добавляем колонку status с созданным типом enum
    op.add_column('tournaments',
        sa.Column('status', sa.Enum('planned', 'active', 'completed', name='tournamentstatus'), 
                 nullable=False, server_default='planned')
    )

def downgrade() -> None:
    # Удаляем колонку status
    op.drop_column('tournaments', 'status')
    
    # Удаляем тип enum
    op.execute("DROP TYPE tournamentstatus") 