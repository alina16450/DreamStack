import pytest
from fastapi import FastAPI, Depends, status
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session, select
from datetime import timedelta

from app.Service.Auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.Service.models import User
from app.Service.database import get_session

# --- SETUP IN-MEMORY DB ---
@pytest.fixture(scope="module")
def engine():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(engine)
    return engine

@pytest.fixture(scope="module")
def session(engine):
    with Session(engine) as session:
        yield session

# Override dependency
@pytest.fixture(scope="module")
def app(session):
    app = FastAPI()

    # Dependency override for get_session
    app.dependency_overrides[get_session] = lambda: session

    @app.get("/protected")
    def protected(user: User = Depends(get_current_user)):
        return {"username": user.username}

    return app

@pytest.fixture(scope="module")
def client(app, session):
    # create a test user
    user = User(username="tester", password_hash=hash_password("Secret1!"))
    session.add(user)
    session.commit()
    session.refresh(user)

    return TestClient(app)

# --- TESTS ---

def test_hash_and_verify():
    plain = "MyPassw0rd!"
    hashed = hash_password(plain)
    assert hashed != plain
    assert verify_password(plain, hashed)
    assert not verify_password("wrong", hashed)


def test_protected_endpoint_valid_token(client, session):
    # fetch the test user
    user = session.exec(select(User).where(User.username == "tester")).first()
    token = create_access_token({"sub": str(user.id)}, expires_delta=timedelta(minutes=5))
    response = client.get(
        "/protected",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json() == {"username": "tester"}


def test_protected_endpoint_no_token(client):
    response = client.get("/protected")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_protected_endpoint_bad_token(client):
    response = client.get(
        "/protected",
        headers={"Authorization": "Bearer badtoken"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_expired_token(client, session):
    user = session.exec(select(User).where(User.username == "tester")).first()
    # create an already expired token
    token = create_access_token({"sub": str(user.id)}, expires_delta=timedelta(seconds=-10))
    response = client.get(
        "/protected",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
