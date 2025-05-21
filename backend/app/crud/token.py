from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models.refresh_token import RefreshToken
from app.utils.logging import get_logger

logger = get_logger("app.crud.token")

def create_refresh_token(db: Session, user_id: int, expires_delta: Optional[timedelta] = None) -> RefreshToken:
    """
    Создает новый refresh-токен для пользователя.
    
    Args:
        db: Сессия базы данных
        user_id: ID пользователя
        expires_delta: Срок действия токена (по умолчанию 30 дней)
        
    Returns:
        RefreshToken: Созданный объект refresh-токена
    """
    try:
        refresh_token = RefreshToken.create_token(user_id, expires_delta)
        db.add(refresh_token)
        db.commit()
        db.refresh(refresh_token)
        logger.info(f"Создан новый refresh токен для пользователя {user_id}")
        return refresh_token
    except SQLAlchemyError as e:
        logger.error(f"Ошибка создания refresh токена: {str(e)}")
        db.rollback()
        raise

def get_refresh_token(db: Session, token: str) -> Optional[RefreshToken]:
    """
    Получает refresh-токен по значению токена.
    
    Args:
        db: Сессия базы данных
        token: Значение токена
        
    Returns:
        Optional[RefreshToken]: Найденный токен или None
    """
    return db.query(RefreshToken).filter(RefreshToken.token == token).first()

def is_token_valid(token: RefreshToken) -> bool:
    """
    Проверяет, действителен ли refresh-токен.
    
    Args:
        token: Объект токена
        
    Returns:
        bool: True если токен действителен, иначе False
    """
    return token is not None and datetime.utcnow() < token.expires_at

def delete_refresh_token(db: Session, token: str) -> bool:
    """
    Удаляет refresh-токен.
    
    Args:
        db: Сессия базы данных
        token: Значение токена для удаления
        
    Returns:
        bool: True если токен успешно удален, иначе False
    """
    try:
        db_token = get_refresh_token(db, token)
        if not db_token:
            return False
            
        db.delete(db_token)
        db.commit()
        logger.info(f"Удален refresh токен для пользователя {db_token.user_id}")
        return True
    except SQLAlchemyError as e:
        logger.error(f"Ошибка удаления refresh токена: {str(e)}")
        db.rollback()
        return False

def delete_all_user_tokens(db: Session, user_id: int) -> bool:
    """
    Удаляет все refresh-токены пользователя (например, при выходе со всех устройств).
    
    Args:
        db: Сессия базы данных
        user_id: ID пользователя
        
    Returns:
        bool: True если операция успешна
    """
    try:
        db.query(RefreshToken).filter(RefreshToken.user_id == user_id).delete()
        db.commit()
        logger.info(f"Удалены все refresh токены пользователя {user_id}")
        return True
    except SQLAlchemyError as e:
        logger.error(f"Ошибка удаления всех refresh токенов пользователя: {str(e)}")
        db.rollback()
        return False

def delete_expired_tokens(db: Session) -> int:
    """
    Удаляет все просроченные токены из базы данных.
    
    Args:
        db: Сессия базы данных
        
    Returns:
        int: Количество удаленных токенов
    """
    try:
        now = datetime.utcnow()
        deleted = db.query(RefreshToken).filter(RefreshToken.expires_at < now).delete()
        db.commit()
        logger.info(f"Удалено {deleted} просроченных refresh токенов")
        return deleted
    except SQLAlchemyError as e:
        logger.error(f"Ошибка удаления просроченных refresh токенов: {str(e)}")
        db.rollback()
        return 0 