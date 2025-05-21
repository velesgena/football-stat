from typing import Optional, List
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.crud.user import get_user
from app.schemas.auth import TokenData
from app.utils.security import SECRET_KEY, ALGORITHM, decode_token
from app.utils.logging import get_logger

# Настройка логгера
logger = get_logger("app.auth")

# Настройка OAuth2 для получения токена
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Получает текущего авторизованного пользователя по JWT-токену.
    
    Args:
        token (str): JWT-токен из заголовка Authorization.
        db (Session): Сессия базы данных.
    
    Returns:
        User: Объект пользователя.
    
    Raises:
        HTTPException: Если токен недействителен или пользователь не найден.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Некорректные учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_token(token)
        if payload is None:
            logger.warning("Недействительный JWT-токен")
            raise credentials_exception
            
        username: str = payload.get("sub")
        if username is None:
            logger.warning("JWT-токен не содержит поле 'sub'")
            raise credentials_exception
            
        token_data = TokenData(
            username=username,
            user_id=payload.get("user_id"),
            role=payload.get("role")
        )
    except JWTError:
        logger.error("Ошибка декодирования JWT-токена")
        raise credentials_exception
    
    user = get_user(db, token_data.user_id) if token_data.user_id else None
    if user is None:
        logger.warning(f"Пользователь с ID {token_data.user_id} не найден")
        raise credentials_exception
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Проверяет, что текущий пользователь активен.
    
    Args:
        current_user (User): Текущий пользователь.
    
    Returns:
        User: Текущий активный пользователь.
    
    Raises:
        HTTPException: Если пользователь неактивен.
    """
    if not current_user.is_active:
        logger.warning(f"Попытка доступа от неактивного пользователя: {current_user.username}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Пользователь неактивен"
        )
    return current_user

def check_role(allowed_roles: List[UserRole]):
    """
    Создает зависимость для проверки ролей пользователя.
    
    Args:
        allowed_roles (List[UserRole]): Список разрешенных ролей.
    
    Returns:
        Callable: Зависимость для проверки ролей.
    """
    async def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            logger.warning(
                f"Пользователь {current_user.username} с ролью {current_user.role} "
                f"пытается выполнить действие, требующее роли {allowed_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Недостаточно прав: требуется одна из ролей {[r.value for r in allowed_roles]}"
            )
        return current_user
    
    return role_checker

# Предопределенные проверки ролей для удобства использования
is_admin = check_role([UserRole.admin])
is_editor_or_admin = check_role([UserRole.admin, UserRole.editor]) 