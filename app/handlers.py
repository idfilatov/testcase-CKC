import uuid
import logging

import fastapi
from sqlalchemy import orm

from app import dto
from app.db import models as db_models


def get_ship_info(session: orm.Session, ship_id: int) -> db_models.Ship:
    item = session.query(db_models.Ship).filter(db_models.Ship.id == ship_id).one_or_none()

    if item is None:
        raise fastapi.HTTPException(
            status_code=fastapi.status.HTTP_404_NOT_FOUND,
            detail='Корабль с таким идентификатором не найден'
        )
    return item


def get_ship_route(session: orm.Session, ship_id: int) -> list[db_models.RoutePoint]:
    items = session.query(db_models.RoutePoint)\
        .filter(db_models.RoutePoint.ship_id == ship_id)\
        .order_by(db_models.RoutePoint.created_at.asc())\
        .all()

    return items


def get_ships_last_positions(session: orm.Session):
    items = session.query(
        db_models.Ship.id, db_models.RoutePoint.latitude, db_models.RoutePoint.longitude, db_models.RoutePoint.speed
    ).filter(

    ).join(
        db_models.RoutePoint, db_models.Ship.last_point_id == db_models.RoutePoint.id
    ).all()

    dto_items = [dto.ShipPosition(
        ship_id=item.id,
        longitude=item.longitude,
        latitude=item.latitude,
        speed=item.speed
    ) for item in items]
    return dto_items


def save_ship_point(ship_id: int, point_data: dto.Position, session: orm.Session):
    ship_item = get_ship_info(session=session, ship_id=ship_id)
    new_point = db_models.RoutePoint(
        ship_id=ship_id,
        longitude=point_data.longitude,
        latitude=point_data.latitude,
        speed=point_data.speed
    )
    session.add(new_point)
    session.flush()
    ship_item.last_point_id = new_point.id
    session.commit()
