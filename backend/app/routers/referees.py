from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.referee import RefereeCreate, RefereeUpdate, RefereeResponse
from app.crud.referee import get_referees, get_referee, create_referee, update_referee, delete_referee
from app.db import get_db
from typing import List

router = APIRouter(prefix="/referees", tags=["referees"])

@router.get("/", response_model=List[RefereeResponse])
def list_referees(db: Session = Depends(get_db)):
    return get_referees(db)

@router.get("/{referee_id}", response_model=RefereeResponse)
def get_referee_by_id(referee_id: int, db: Session = Depends(get_db)):
    ref = get_referee(db, referee_id)
    if not ref:
        raise HTTPException(status_code=404, detail="Referee not found")
    return ref

@router.post("/", response_model=RefereeResponse)
def create_referee_api(referee: RefereeCreate, db: Session = Depends(get_db)):
    return create_referee(db, referee)

@router.put("/{referee_id}", response_model=RefereeResponse)
def update_referee_api(referee_id: int, referee: RefereeUpdate, db: Session = Depends(get_db)):
    ref = update_referee(db, referee_id, referee)
    if not ref:
        raise HTTPException(status_code=404, detail="Referee not found")
    return ref

@router.delete("/{referee_id}", response_model=bool)
def delete_referee_api(referee_id: int, db: Session = Depends(get_db)):
    return delete_referee(db, referee_id) 