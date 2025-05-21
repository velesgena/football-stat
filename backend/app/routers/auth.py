from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app.schemas.auth import Token, LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse
from app.schemas.user import UserCreate, UserResponse
from app.crud.user import authenticate_user, create_user, get_user_by_email, get_user_by_username, get_user
from app.crud.token import create_refresh_token, get_refresh_token, is_token_valid, delete_refresh_token, delete_all_user_tokens
from app.utils.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.utils.logging import get_logger
from app.models.user import UserRole
from app.dependencies.auth import get_current_active_user, is_admin

logger = get_logger("app.router.auth")

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={401: {"description": "Не авторизован"}},
)

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Аутентификация пользователя и получение JWT-токена.
    
    - **username**: Имя пользователя
    - **password**: Пароль
    
    Возвращает JWT-токен, который нужно использовать в заголовке Authorization.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        logger.warning(f"Неудачная попытка входа для пользователя: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    logger.info(f"Пользователь {user.username} успешно вошел в систему")
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login/json", response_model=LoginResponse)
async def login_json(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Аутентификация пользователя с JSON-запросом и получение JWT-токена.
    
    - **username**: Имя пользователя
    - **password**: Пароль
    
    Возвращает JWT-токен и информацию о пользователе.
    """
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        logger.warning(f"Неудачная попытка входа для пользователя: {login_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Создаем access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    # Создаем refresh token
    refresh_token_obj = create_refresh_token(db, user.id)
    
    logger.info(f"Пользователь {user.username} успешно вошел в систему через JSON API")
    return {
        "access_token": access_token,
        "refresh_token": refresh_token_obj.token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "role": user.role.value
    }

@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(token_data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Обновление access токена с использованием refresh токена.
    
    - **refresh_token**: Refresh токен, полученный при входе в систему
    
    Возвращает новую пару токенов (access и refresh).
    """
    # Проверяем refresh токен
    refresh_token = get_refresh_token(db, token_data.refresh_token)
    if not refresh_token or not is_token_valid(refresh_token):
        # Если токен недействителен, удаляем его
        if refresh_token:
            delete_refresh_token(db, token_data.refresh_token)
        
        logger.warning("Попытка обновления токена с недействительным refresh токеном")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный или просроченный refresh токен",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Получаем пользователя
    user = get_user(db, refresh_token.user_id)
    if not user or not user.is_active:
        logger.warning(f"Попытка обновления токена для неактивного пользователя ID: {refresh_token.user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не активен",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Создаем новый access токен
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    # Удаляем старый refresh токен и создаем новый
    delete_refresh_token(db, token_data.refresh_token)
    new_refresh_token = create_refresh_token(db, user.id)
    
    logger.info(f"Обновлены токены для пользователя {user.username}")
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token.token,
        "token_type": "bearer"
    }

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(token_data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Выход из системы (удаление refresh токена).
    
    - **refresh_token**: Refresh токен для удаления
    """
    # Удаляем refresh токен
    delete_refresh_token(db, token_data.refresh_token)
    logger.info("Выход из системы, refresh токен удален")
    return {}

@router.post("/logout/all", status_code=status.HTTP_204_NO_CONTENT)
async def logout_all_devices(current_user = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """
    Выход из системы на всех устройствах (удаление всех refresh токенов пользователя).
    Требует действительный access токен.
    """
    delete_all_user_tokens(db, current_user.id)
    logger.info(f"Пользователь {current_user.username} вышел из системы на всех устройствах")
    return {}

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Регистрация нового пользователя.
    
    - **username**: Имя пользователя (уникальное)
    - **email**: Email (уникальный)
    - **password**: Пароль (минимум 8 символов, должен содержать буквы и цифры)
    - **full_name**: Полное имя (опционально)
    """
    # Проверяем, что пользователь с таким email не существует
    existing_email = get_user_by_email(db, user_data.email)
    if existing_email:
        logger.warning(f"Попытка регистрации с существующим email: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email уже зарегистрирован"
        )
    
    # Проверяем, что пользователь с таким username не существует
    existing_username = get_user_by_username(db, user_data.username)
    if existing_username:
        logger.warning(f"Попытка регистрации с существующим username: {user_data.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Имя пользователя уже занято"
        )
    
    # Регистрируем пользователя
    try:
        user = create_user(db, user_data)
        logger.info(f"Пользователь {user.username} успешно зарегистрирован")
        return user
    except Exception as e:
        logger.error(f"Ошибка при регистрации пользователя: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при регистрации пользователя"
        )

@router.post("/register/admin", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_admin(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(is_admin)
):
    """
    Регистрация нового администратора (доступно только для администраторов).
    
    - **username**: Имя пользователя (уникальное)
    - **email**: Email (уникальный)
    - **password**: Пароль (минимум 8 символов, должен содержать буквы и цифры)
    - **full_name**: Полное имя (опционально)
    """
    # Проверяем, что пользователь с таким email не существует
    existing_email = get_user_by_email(db, user_data.email)
    if existing_email:
        logger.warning(f"Попытка регистрации администратора с существующим email: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email уже зарегистрирован"
        )
    
    # Проверяем, что пользователь с таким username не существует
    existing_username = get_user_by_username(db, user_data.username)
    if existing_username:
        logger.warning(f"Попытка регистрации администратора с существующим username: {user_data.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Имя пользователя уже занято"
        )
    
    # Регистрируем пользователя с ролью администратора
    try:
        user = create_user(db, user_data, role=UserRole.admin)
        logger.info(f"Администратор {user.username} успешно зарегистрирован")
        return user
    except Exception as e:
        logger.error(f"Ошибка при регистрации администратора: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при регистрации администратора"
        )

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user = Depends(get_current_active_user)):
    """
    Получение информации о текущем авторизованном пользователе.
    """
    return current_user 