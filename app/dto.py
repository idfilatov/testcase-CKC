import pydantic


class ShipInfo(pydantic.BaseModel):
    name: str
    registration_number: str
    photo: str


class RoutePoint(pydantic.BaseModel):
    longitude: float
    latitude: float


class Route(pydantic.BaseModel):
    ship_id: int
    points: list[RoutePoint]


class Position(pydantic.BaseModel):
    longitude: float
    latitude: float
    speed: float


class ShipPosition(Position):
    ship_id: int
