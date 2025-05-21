import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Union
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.utils.logging import get_logger

logger = get_logger("app.security")

# Настройки безопасности и JWT
SECRET_KEY = os.getenv("SECRET_KEY", "football-stats-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Настройка контекста для хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Проверяет соответствие между открытым паролем и хешем.
    
    Args:
        plain_password (str): Открытый пароль.
        hashed_password (str): Хешированный пароль.
    
    Returns:
        bool: True, если пароль соответствует хешу, иначе False.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Создает защищенный хеш пароля.
    
    Args:
        password (str): Открытый пароль.
    
    Returns:
        str: Хешированный пароль.
    """
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Создает JWT-токен доступа на основе переданных данных.
    
    Args:
        data (Dict[str, Any]): Данные для включения в токен.
        expires_delta (Optional[timedelta], optional): Время жизни токена. 
            По умолчанию None (используется ACCESS_TOKEN_EXPIRE_MINUTES).
    
    Returns:
        str: Сгенерированный JWT-токен.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    
    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        logger.error(f"Ошибка при создании JWT-токена: {str(e)}")
        raise

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Декодирует JWT-токен и возвращает содержащиеся в нем данные.
    
    Args:
        token (str): JWT-токен для декодирования.
    
    Returns:
        Optional[Dict[str, Any]]: Данные из токена или None, если токен недействителен.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning(f"Ошибка при декодировании JWT-токена: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Неожиданная ошибка при декодировании JWT-токена: {str(e)}")
        return None 