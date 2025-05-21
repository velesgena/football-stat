from sqlalchemy import Column, String, Integer, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Referee(BaseModel):
    __tablename__ = "referees"
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False, index=True)
    patronymic = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    matches = relationship("Match", back_populates="referee") 