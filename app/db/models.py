import datetime

from sqlalchemy import Column, String, Integer, Numeric, DATETIME, ForeignKey
from sqlalchemy.orm import declarative_base
Base = declarative_base()


class Ship(Base):
    __tablename__ = 'ships'

    id = Column(Integer, autoincrement=True, primary_key=True)
    created_at = Column(DATETIME, nullable=False, default=lambda: datetime.datetime.now())

    name = Column(String, nullable=False)
    registration_number = Column(String, nullable=False, unique=True)
    photo = Column(String, nullable=True)

    last_point_id = Column(Integer, ForeignKey('route_points.id'), nullable=True)


class RoutePoint(Base):
    __tablename__ = 'route_points'

    id = Column(Integer, autoincrement=True, primary_key=True)
    created_at = Column(DATETIME, nullable=False, default=lambda: datetime.datetime.now())
    ship_id = Column(Integer, ForeignKey('ships.id'), nullable=False)

    longitude = Column(
        Numeric(3, 15), nullable=False
    )  # слева направо. 0 на лондоне, через россию (вправо) +180, через атлантический океан (влево) -180
    latitude = Column(
        Numeric(3, 15), nullable=False
    )  # север / на юг. 0 на экваторе, +90 север, -90 юг
    speed = Column(Numeric(3, 2), nullable=False)
