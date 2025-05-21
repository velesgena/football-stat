from fastapi import FastAPI, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback
from starlette.responses import JSONResponse
from fastapi_utils.tasks import repeat_every
import asyncio

from app.database import get_db
from app.routers import leagues, cities, stadiums, teams, players, tournaments, matches, match_stats, routers
from app.utils.logging import api_logger as logger
from app.core.tasks import cleanup_expired_tokens

description = """
# Football Stats API

API для хранения и получения футбольной статистики.

## Возможности

- **Команды**: Управление командами, их игроками и стадионами
- **Игроки**: Информация об игроках, их статистика
- **Турниры**: Управление лигами, турнирами, матчами
- **Матчи**: Расписание матчей, результаты и статистика
- **WebSocket**: Получение обновлений матчей в реальном времени
- **Пользователи**: Регистрация, аутентификация и управление пользователями
- **Авторизация**: Разделение прав доступа по ролям (пользователь, редактор, администратор)

## Статус разработки

API находится в активной разработке. Планируется добавление новых функций и улучшение существующих.
"""

tags_metadata = [
    {
        "name": "auth",
        "description": "Операции аутентификации и авторизации пользователей",
    },
    {
        "name": "users",
        "description": "Управление пользователями и их профилями",
    },
    {
        "name": "leagues",
        "description": "Операции с лигами и чемпионатами",
    },
    {
        "name": "cities",
        "description": "Управление информацией о городах и населенных пунктах",
    },
    {
        "name": "stadiums",
        "description": "Операции со стадионами, вместимость, местоположение",
    },
    {
        "name": "teams",
        "description": "Управление командами, их составами и статистикой",
    },
    {
        "name": "players",
        "description": "Операции с игроками, личная информация и статистика",
    },
    {
        "name": "tournaments",
        "description": "Управление турнирами, их форматами и участниками",
    },
    {
        "name": "matches",
        "description": "Управление матчами, их расписанием и результатами",
    },
    {
        "name": "match_stats",
        "description": "Статистика матчей, голы, карточки, замены и др.",
    },
    {
        "name": "referees",
        "description": "Информация о судьях и их назначениях на матчи",
    },
    {
        "name": "websocket",
        "description": "WebSocket соединения для получения обновлений в реальном времени",
    },
]

app = FastAPI(
    title="Football Stats API", 
    description=description,
    version="0.2.0",
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
    debug=True
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Временно разрешаем все источники для отладки
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы
    allow_headers=["*"],  # Разрешаем все заголовки
)

# Обработчики исключений
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"Ошибка валидации запроса: {str(exc)}")
    return JSONResponse(
        status_code=422,
        content={"detail": "Ошибка валидации запроса", "errors": str(exc)},
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"HTTP ошибка: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Необработанная ошибка: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Внутренняя ошибка сервера", "message": str(exc)},
    )

# Логируем запросы
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Запрос: {request.method} {request.url.path}")
    logger.debug(f"Заголовки запроса: {request.headers}")
    
    try:
        response = await call_next(request)
        logger.info(f"Ответ: {response.status_code}")
        # Принудительно выставляем кодировку UTF-8 для JSON-ответов
        if response.headers.get("content-type", "").startswith("application/json"):
            response.headers["content-type"] = "application/json; charset=utf-8"
        return response
    except Exception as e:
        logger.error(f"Ошибка при обработке запроса: {str(e)}")
        logger.error(traceback.format_exc())
        # Возвращаем ответ с ошибкой вместо распространения исключения
        return JSONResponse(
            status_code=500,
            content={"detail": "Внутренняя ошибка сервера", "message": str(e)}
        )

# Регистрация фоновых задач
@app.on_event("startup")
@repeat_every(seconds=60 * 60 * 24)  # Запускать раз в день
async def cleanup_tokens_task() -> None:
    """Фоновая задача для очистки просроченных refresh токенов"""
    logger.info("Запуск плановой задачи очистки просроченных токенов")
    await cleanup_expired_tokens()

# Подключаем роутеры
for router in routers:
    app.include_router(router)

@app.get("/", tags=["status"])
def read_root():
    """
    Проверка работоспособности API.
    
    Возвращает статус работы бэкенда.
    """
    logger.info("Вызван корневой эндпоинт")
    return {"message": "Бэкенд Football stats работает!"}

@app.get("/db-test", tags=["status"])
def test_db(db: Session = Depends(get_db)):
    """
    Проверка соединения с базой данных.
    
    Проверяет, что соединение с базой данных работает корректно.
    """
    logger.info("Проверка соединения с базой данных")
    return {"message": "Соединение с базой данных работает"}