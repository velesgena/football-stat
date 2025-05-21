from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from typing import Optional
from app.utils.websocket import connection_manager
from app.utils.logging import get_logger

logger = get_logger("app.router.ws")

router = APIRouter(
    prefix="/ws",
    tags=["websocket"],
)

@router.websocket("/")
async def websocket_endpoint(websocket: WebSocket, group: Optional[str] = None):
    """
    Эндпоинт для установки WebSocket соединения.
    
    Args:
        websocket (WebSocket): WebSocket соединение.
        group (str, optional): Группа, к которой присоединить клиента.
    """
    await connection_manager.connect(websocket, group)
    try:
        while True:
            # Ожидаем сообщения от клиента
            data = await websocket.receive_text()
            logger.debug(f"Получено сообщение от клиента: {data}")
            
            # Просто отвечаем тем же сообщением (эхо)
            await connection_manager.send_personal_message(data, websocket)
    except WebSocketDisconnect:
        # Клиент отключился
        connection_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Ошибка в WebSocket соединении: {str(e)}")
        connection_manager.disconnect(websocket)

@router.websocket("/matches")
async def matches_endpoint(websocket: WebSocket):
    """
    Эндпоинт для подписки на обновления матчей.
    
    Args:
        websocket (WebSocket): WebSocket соединение.
    """
    # Подключаем клиента к группе match_updates
    await connection_manager.connect(websocket, "match_updates")
    try:
        # Отправляем приветственное сообщение
        await connection_manager.send_personal_message(
            {"type": "info", "message": "Вы подписаны на обновления матчей"}, 
            websocket
        )
        
        while True:
            # Ожидаем сообщения от клиента (например, для фильтрации)
            data = await websocket.receive_text()
            logger.debug(f"Получено сообщение от клиента в группе match_updates: {data}")
    except WebSocketDisconnect:
        # Клиент отключился
        connection_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Ошибка в WebSocket соединении для матчей: {str(e)}")
        connection_manager.disconnect(websocket)

# Функция для использования в других модулях для отправки обновлений о матчах
async def send_match_update(match_data):
    """
    Отправляет обновление о матче всем подписчикам.
    
    Args:
        match_data (dict): Данные матча для отправки.
    """
    message = {
        "type": "match_update",
        "data": match_data
    }
    await connection_manager.broadcast_to_group("match_updates", message) 