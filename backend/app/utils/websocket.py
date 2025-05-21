import asyncio
import json
from typing import Dict, List, Any, Optional, Set
from fastapi import WebSocket, WebSocketDisconnect
from app.utils.logging import get_logger

logger = get_logger("app.websocket")

class ConnectionManager:
    """
    Менеджер WebSocket соединений.
    Управляет активными соединениями и групповыми сообщениями.
    """
    
    def __init__(self):
        # Активные соединения
        self.active_connections: List[WebSocket] = []
        # Соединения, сгруппированные по категориям
        self.connection_groups: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, group: Optional[str] = None):
        """
        Устанавливает WebSocket соединение и опционально добавляет его в группу.
        
        Args:
            websocket (WebSocket): Объект WebSocket соединения.
            group (str, optional): Группа, к которой добавить соединение.
        """
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket соединение установлено: {websocket.client}")
        
        if group:
            if group not in self.connection_groups:
                self.connection_groups[group] = set()
            self.connection_groups[group].add(websocket)
            logger.info(f"Соединение добавлено в группу: {group}")
    
    def disconnect(self, websocket: WebSocket):
        """
        Закрывает WebSocket соединение и удаляет его из групп.
        
        Args:
            websocket (WebSocket): Объект WebSocket соединения.
        """
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket соединение закрыто: {websocket.client}")
        
        # Удаляем соединение из всех групп
        for group in self.connection_groups:
            if websocket in self.connection_groups[group]:
                self.connection_groups[group].remove(websocket)
                logger.debug(f"Соединение удалено из группы: {group}")
    
    async def send_personal_message(self, message: Any, websocket: WebSocket):
        """
        Отправляет сообщение конкретному клиенту.
        
        Args:
            message (Any): Сообщение для отправки (будет сконвертировано в JSON).
            websocket (WebSocket): WebSocket соединение для отправки.
        """
        try:
            message_str = json.dumps(message) if not isinstance(message, str) else message
            await websocket.send_text(message_str)
            logger.debug(f"Личное сообщение отправлено: {websocket.client}")
        except Exception as e:
            logger.error(f"Ошибка при отправке личного сообщения: {str(e)}")
    
    async def broadcast(self, message: Any):
        """
        Отправляет сообщение всем подключенным клиентам.
        
        Args:
            message (Any): Сообщение для отправки (будет сконвертировано в JSON).
        """
        if not self.active_connections:
            logger.debug("Нет активных соединений для широковещательной рассылки")
            return
        
        disconnected_websockets = []
        message_str = json.dumps(message) if not isinstance(message, str) else message
        
        for websocket in self.active_connections:
            try:
                await websocket.send_text(message_str)
            except WebSocketDisconnect:
                disconnected_websockets.append(websocket)
            except Exception as e:
                logger.error(f"Ошибка при отправке широковещательного сообщения: {str(e)}")
                disconnected_websockets.append(websocket)
        
        # Удаляем отключенные соединения
        for websocket in disconnected_websockets:
            self.disconnect(websocket)
        
        logger.info(f"Широковещательное сообщение отправлено {len(self.active_connections)} клиентам")
    
    async def broadcast_to_group(self, group: str, message: Any):
        """
        Отправляет сообщение всем клиентам в определенной группе.
        
        Args:
            group (str): Группа, которой отправить сообщение.
            message (Any): Сообщение для отправки (будет сконвертировано в JSON).
        """
        if group not in self.connection_groups or not self.connection_groups[group]:
            logger.debug(f"Нет активных соединений в группе {group} для рассылки")
            return
        
        disconnected_websockets = []
        message_str = json.dumps(message) if not isinstance(message, str) else message
        
        for websocket in self.connection_groups[group]:
            try:
                await websocket.send_text(message_str)
            except WebSocketDisconnect:
                disconnected_websockets.append(websocket)
            except Exception as e:
                logger.error(f"Ошибка при отправке сообщения группе: {str(e)}")
                disconnected_websockets.append(websocket)
        
        # Удаляем отключенные соединения
        for websocket in disconnected_websockets:
            self.disconnect(websocket)
        
        logger.info(f"Сообщение группе {group} отправлено {len(self.connection_groups[group])} клиентам")

# Создаем глобальный экземпляр менеджера соединений
connection_manager = ConnectionManager() 