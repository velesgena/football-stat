from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import secrets
import string
from datetime import datetime, timedelta

from app.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.crud.user import get_user, get_users, update_user, delete_user
from app.dependencies.auth import get_current_active_user, is_admin, is_editor_or_admin
from app.utils.logging import get_logger
from app.schemas.auth import Token
from app.utils.security import get_password_hash, create_access_token

logger = get_logger("app.router.users")

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={401: {"description": "Unauthorized"}},
)

# Схемы для функционала сброса пароля
from pydantic import BaseModel, EmailStr, Field

class PasswordResetRequest(BaseModel):
    email: EmailStr = Field(..., description="Email пользователя для сброса пароля")

class PasswordResetConfirm(BaseModel):
    token: str = Field(..., description="Токен сброса пароля")
    new_password: str = Field(..., min_length=8, description="Новый пароль")

# Хранилище токенов сброса пароля (в реальном приложении лучше использовать Redis или БД)
password_reset_tokens = {}

@router.get("/me", response_model=UserResponse)
async def read_user_me(current_user = Depends(get_current_active_user)):
    """Получение информации о текущем пользователе"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Обновление информации о текущем пользователе"""
    updated_user = update_user(db, current_user.id, user_data)
    if updated_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    logger.info(f"Пользователь {current_user.username} обновил свой профиль")
    return updated_user

@router.get("/", response_model=List[UserResponse])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(is_admin)  # Только администраторы могут получить список пользователей
):
    """Получение списка всех пользователей (только для администраторов)"""
    users = get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=UserResponse)
async def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(is_admin)  # Только администраторы могут получить информацию о конкретном пользователе
):
    """Получение информации о пользователе по ID (только для администраторов)"""
    user = get_user(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(is_admin)  # Только администраторы могут удалять пользователей
):
    """Удаление пользователя (только для администраторов)"""
    # Запрещаем удалять самого себя
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя удалить собственный аккаунт"
        )
        
    success = delete_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    logger.info(f"Администратор {current_user.username} удалил пользователя с ID {user_id}")

# Функционал сброса пароля

def generate_reset_token():
    """Генерирует случайный токен для сброса пароля"""
    alphabet = string.ascii_letters + string.digits
    token = ''.join(secrets.choice(alphabet) for _ in range(64))
    return token

# Заглушка для отправки email
def send_password_reset_email(email: str, token: str):
    """
    Отправляет email со ссылкой для сброса пароля.
    В реальном приложении здесь должна быть отправка настоящего email.
    """
    # В реальном приложении здесь использовался бы модуль для отправки email
    logger.info(f"Отправка email для сброса пароля на адрес {email} с токеном {token[:10]}...")
    # Пример: send_email(to=email, subject="Сброс пароля", body=f"Ваш токен для сброса пароля: {token}")

@router.post("/reset-password/request", status_code=status.HTTP_202_ACCEPTED)
async def request_password_reset(
    request_data: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Запрос на сброс пароля. Отправляет email с токеном для сброса пароля.
    """
    from app.crud.user import get_user_by_email
    
    user = get_user_by_email(db, request_data.email)
    if user:
        # Генерируем токен
        token = generate_reset_token()
        # Сохраняем токен с временем истечения (1 час)
        expiry = datetime.utcnow() + timedelta(hours=1)
        password_reset_tokens[token] = {"user_id": user.id, "expiry": expiry}
        
        # Отправляем email (в фоновом режиме)
        background_tasks.add_task(send_password_reset_email, request_data.email, token)
    
    # Всегда возвращаем 202 Accepted, даже если email не найден,
    # чтобы не раскрывать информацию о существовании пользователя
    return {"message": "Если указанный email зарегистрирован, вы получите инструкции по сбросу пароля"}

@router.post("/reset-password/confirm", response_model=Token)
async def confirm_password_reset(
    confirm_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    Подтверждение сброса пароля с использованием токена и установка нового пароля.
    """
    # Проверяем, существует ли токен
    if confirm_data.token not in password_reset_tokens:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недействительный или устаревший токен сброса пароля"
        )
    
    # Получаем данные токена
    token_data = password_reset_tokens[confirm_data.token]
    
    # Проверяем срок действия токена
    if datetime.utcnow() > token_data["expiry"]:
        # Удаляем просроченный токен
        del password_reset_tokens[confirm_data.token]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Токен сброса пароля истек"
        )
    
    # Получаем пользователя
    user = get_user(db, token_data["user_id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    # Обновляем пароль
    hashed_password = get_password_hash(confirm_data.new_password)
    user_data = UserUpdate(password=confirm_data.new_password)
    updated_user = update_user(db, user.id, user_data)
    
    # Удаляем использованный токен
    del password_reset_tokens[confirm_data.token]
    
    # Создаем JWT-токен для автоматического входа
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id, "role": user.role.value}
    )
    
    logger.info(f"Пользователь {user.username} успешно сбросил пароль")
    return {"access_token": access_token, "token_type": "bearer"} 