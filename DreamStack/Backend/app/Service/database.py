import os

from sqlmodel import create_engine, Session, SQLModel
from sqlalchemy.orm import sessionmaker

sqlite_file_name = "mydatabase.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(
    bind=engine,
    class_=Session,
    expire_on_commit=True,
)

def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def init_db():
    if not os.path.exists(sqlite_file_name):
        SQLModel.metadata.create_all(engine)
        print("Database created.")
    else:
        print("Database already exists. Skipping creation.")


