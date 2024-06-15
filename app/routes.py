import fastapi
from sqlalchemy import orm

from app import dto, handlers
from app.db.utils import get_db_connection
from app.manager import manager


router = fastapi.APIRouter(prefix="/ships", tags=['Ship'])


@router.get(
    path='/move'
)
async def start_ship_moves(session: orm.Session = fastapi.Depends(get_db_connection)):
    """
    Служебный эндпоинт для запуска имитации поступления данных о положении кораблей\n
    При каждом вызове очистит таблицу точек, и начнет выстраивать маршрут заново
    """
    from app import ship_mover
    from app._support._utils import drop_routes
    drop_routes(session)
    await ship_mover.main()


@router.get(
    path='',
    response_model=list[dto.ShipPosition]
)
def get_ships_last_positions(
    session: orm.Session = fastapi.Depends(get_db_connection)
):
    """
    Эндпоинт вернет последнюю точку каждого корабля
    """
    return handlers.get_ships_last_positions(session=session)


@router.get(
    path='/{ship_id}',
    response_model=dto.ShipInfo
)
def get_ship_info(
    ship_id: int,
    session: orm.Session = fastapi.Depends(get_db_connection)
):
    """
    Эндпоинт вернет данные о корабле
    """
    return handlers.get_ship_info(session=session, ship_id=ship_id)


@router.post(
    path='/{ship_id}/point',
    response_model=None
)
async def save_ship_point(
    ship_id: int,
    point_data: dto.Position,
    session: orm.Session = fastapi.Depends(get_db_connection)
):
    """
    Эндпоинт сохранит новую точку на маршруте корабля
    """
    await handlers.save_ship_point(ship_id=ship_id, point_data=point_data, session=session)
    return


@router.get(
    path='/{ship_id}/route',
    response_model=list[dto.RoutePoint]
)
def get_ship_route(
    ship_id: int,
    session: orm.Session = fastapi.Depends(get_db_connection)
):
    """
    Эндпоинт вернет точки маршрута, пройденного кораблем
    """
    return handlers.get_ship_route(session=session, ship_id=ship_id)


@router.websocket(path='/ws')
async def ships_updates(websocket: fastapi.WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except fastapi.WebSocketDisconnect:
        manager.disconnect(websocket)
