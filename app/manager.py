from fastapi import WebSocket

from app.config import logger


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        logger.info(f'Новое соедиение {websocket=}')
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        logger.info(f'Удаление соедиения {websocket=}')
        self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        logger.info(f'Отправка новой позиции всем соединениям {data=}')
        for connection in self.active_connections:
            await connection.send_json(data)


manager = ConnectionManager()
