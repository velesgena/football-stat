from sqlalchemy.orm import Session
from app.models.referee import Referee
from app.schemas.referee import RefereeCreate, RefereeUpdate

# Получить всех судей
def get_referees(db: Session):
    return db.query(Referee).all()

# Получить судью по id
def get_referee(db: Session, referee_id: int):
    return db.query(Referee).filter(Referee.id == referee_id).first()

# Создать судью
def create_referee(db: Session, referee: RefereeCreate):
    db_ref = Referee(**referee.dict())
    db.add(db_ref)
    db.commit()
    db.refresh(db_ref)
    return db_ref

# Обновить судью
def update_referee(db: Session, referee_id: int, referee: RefereeUpdate):
    db_ref = get_referee(db, referee_id)
    if not db_ref:
        return None
    for key, value in referee.dict(exclude_unset=True).items():
        setattr(db_ref, key, value)
    db.commit()
    db.refresh(db_ref)
    return db_ref

# Удалить судью
def delete_referee(db: Session, referee_id: int):
    db_ref = get_referee(db, referee_id)
    if not db_ref:
        return False
    db.delete(db_ref)
    db.commit()
    return True 