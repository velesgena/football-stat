#!/bin/bash
cd backend
bash -c "export PYTHONPATH=\$PYTHONPATH:$(pwd) && python -m alembic upgrade head"
echo "Migration completed!" 