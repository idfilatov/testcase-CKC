import os
import json
import uuid
import datetime

from app.db.models import Ship, RoutePoint
from app.db.utils import get_db_connection

current_file_dir = os.path.dirname(os.path.abspath(__file__))


def load_route(filename) -> list:
    route_json = json.load(open(os.path.join(current_file_dir, filename)))
    routes = route_json['features'][0]['geometry']['coordinates']

    return routes


def generate_mock_ships():
    session = next(get_db_connection())
    session.query(Ship).delete()
    session.query(RoutePoint).delete()
    session.commit()

    black_pearl = Ship(
        name='Черная Жемчужина',
        registration_number='gal-32',
        photo=open(os.path.join(current_file_dir, 'black_pearl_photo.txt')).read()
    )
    dutchman = Ship(
        name='Летучий Голландец',
        registration_number='gal-42-2-tr',
        photo = open(os.path.join(current_file_dir, 'dutchman_photo.txt')).read()
    )
    mary = Ship(
        name='Тихая Мэри',
        registration_number='btl-100',
        photo = open(os.path.join(current_file_dir, 'mary_photo.txt')).read()
    )
    queen_anne = Ship(
        name='Месть Королевы Анны',
        registration_number='btl-101',
        photo = open(os.path.join(current_file_dir, 'queen_anne_photo.txt')).read()
    )
    dauntless = Ship(
        name='Разящий',
        registration_number='btl-102',
        photo = open(os.path.join(current_file_dir, 'dauntless_photo.txt')).read()
    )
    ships = [black_pearl, dutchman, mary, queen_anne, dauntless]
    session.add_all(ships)
    session.flush()


    # black_pearl_start_point = RoutePoint(
    #     ship_id=black_pearl.id,
    #     longitude=load_route('1_route.json')[0][0],
    #     latitude=load_route('1_route.json')[0][1],
    #     speed=0
    # )
    #
    # dutchman_start_point = RoutePoint(
    #     ship_id=dutchman.id,
    #     longitude=load_route('3_route.json')[0][0],
    #     latitude=load_route('3_route.json')[0][1],
    #     speed=0
    # )
    #
    # mary_start_point = RoutePoint(
    #     ship_id=mary.id,
    #     longitude=load_route('4_route.json')[0][0],
    #     latitude=load_route('4_route.json')[0][1],
    #     speed=0
    # )
    #
    # queen_anne_start_point = RoutePoint(
    #     ship_id=queen_anne.id,
    #     longitude=load_route('5_route.json')[0][0],
    #     latitude=load_route('5_route.json')[0][1],
    #     speed=0
    # )
    #
    # dauntless_start_point = RoutePoint(
    #     ship_id=dauntless.id,
    #     longitude=load_route('2_route.json')[0][0],
    #     latitude=load_route('2_route.json')[0][1],
    #     speed=0
    # )

    start_points = [RoutePoint(
        ship_id=item.id,
        longitude=load_route(f'{item.id}_route.json')[0][0],
        latitude=load_route(f'{item.id}_route.json')[0][1],
        speed=0
    ) for item in ships]

    session.add_all(start_points)
    session.flush()

    black_pearl.last_point_id = start_points[0].id
    dutchman.last_point_id = start_points[1].id
    mary.last_point_id = start_points[2].id
    queen_anne.last_point_id = start_points[3].id
    dauntless.last_point_id = start_points[4].id

    session.commit()



def drop_mock_ships(session):
    session.query(Ship).delete()
    session.query(RoutePoint).delete()
    session.commit()
