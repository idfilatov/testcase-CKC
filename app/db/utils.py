import os

from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

from app.db.models import Base

current_file_dir = os.path.dirname(os.path.abspath(__file__))
engine = create_engine(f'sqlite:///{current_file_dir}/ships_database.db', echo=False)

Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)


def get_db_connection():
    session = Session()
    try:
        yield session
    finally:
        session.close()
