from typing import List, Optional
import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate
from app.utils.security import get_password_hash, verify_password

# Настройка логгера
logger = logging.getLogger(__name__)

def get_user(db: Session, user_id: int) -> Optional[User]:
    """Получение пользователя по ID"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Получение пользователя по email"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Получение пользователя по имени пользователя"""
    return db.query(User).filter(User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Получение списка пользователей с пагинацией"""
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate, role: UserRole = UserRole.user) -> User:
    """Создание нового пользователя"""
    logger.debug(f"Создание пользователя: {user.username}")
    
    try:
        # Хешируем пароль
        hashed_password = get_password_hash(user.password)
        
        # Создаем объект модели пользователя
        user_data = user.model_dump(exclude={"password"})
        db_user = User(**user_data, hashed_password=hashed_password, role=role)
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        logger.info(f"Пользователь {db_user.username} успешно создан с ID: {db_user.id}")
        return db_user
    except SQLAlchemyError as e:
        logger.error(f"Ошибка SQLAlchemy при создании пользователя: {str(e)}")
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"Неожиданная ошибка при создании пользователя: {str(e)}")
        db.rollback()
        raise

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Аутентификация пользователя по имени и паролю"""
    user = get_user_by_username(db, username)
    if not user:
        logger.warning(f"Пользователь с именем {username} не найден")
        return None
    
    if not user.is_active:
        logger.warning(f"Пользователь {username} деактивирован")
        return None
    
    if not verify_password(password, user.hashed_password):
        logger.warning(f"Неверный пароль для пользователя {username}")
        return None
    
    logger.info(f"Пользователь {username} успешно аутентифицирован")
    return user

def update_user(db: Session, user_id: int, user_data: UserUpdate) -> Optional[User]:
    """Обновление данных пользователя"""
    db_user = get_user(db, user_id)
    if not db_user:
        logger.warning(f"Пользователь с ID {user_id} не найден")
        return None
    
    # Обновляем данные пользователя
    update_dict = user_data.model_dump(exclude_unset=True)
    
    # Если передан пароль, хешируем его
    if "password" in update_dict:
        update_dict["hashed_password"] = get_password_hash(update_dict.pop("password"))
    
    # Обновляем поля
    for key, value in update_dict.items():
        setattr(db_user, key, value)
    
    try:
        db.commit()
        db.refresh(db_user)
        logger.info(f"Пользователь с ID {user_id} успешно обновлен")
        return db_user
    except SQLAlchemyError as e:
        logger.error(f"Ошибка SQLAlchemy при обновлении пользователя: {str(e)}")
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"Неожиданная ошибка при обновлении пользователя: {str(e)}")
        db.rollback()
        raise

def delete_user(db: Session, user_id: int) -> bool:
    """Удаление пользователя"""
    db_user = get_user(db, user_id)
    if not db_user:
        logger.warning(f"Пользователь с ID {user_id} не найден")
        return False
    
    try:
        db.delete(db_user)
        db.commit()
        logger.info(f"Пользователь с ID {user_id} успешно удален")
        return True
    except SQLAlchemyError as e:
        logger.error(f"Ошибка SQLAlchemy при удалении пользователя: {str(e)}")
        db.rollback()
        return False
    except Exception as e:
        logger.error(f"Неожиданная ошибка при удалении пользователя: {str(e)}")
        db.rollback()
        return False 