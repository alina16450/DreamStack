from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from app.Service import models
import pytest
from sqlmodel import SQLModel, create_engine, Session

from app.Service.models import User, BucketItem


@pytest.fixture
def session():
    engine = create_engine("sqlite://", echo=False)
    SQLModel.metadata.create_all(engine)  # create all tables
    with Session(engine) as session:
        yield session  # provide session to tests


def test_bucket_item_base_model():
    item = models.BucketItemBase(name="test_name", country="test_country", city="test_city", category="test_category",
                                 description="test_description")
    assert item.name == "test_name"
    assert item.country == "test_country"
    assert item.city == "test_city"
    assert item.category == "test_category"
    assert item.description == "test_description"
    assert item.visited is False


def test_bucket_item_model(session):
    user = User(username="testuser", password_hash="hashedpw")
    session.add(user)
    session.commit()
    session.refresh(user)

    item = BucketItem(
        name="Visit Tokyo",
        country="Japan",
        city="Tokyo",
        category="Natural",
        description="Experience cherry blossoms",
        user_id=user.id
    )
    session.add(item)
    session.commit()
    session.refresh(item)

    assert item.id is not None
    assert item.name == "Visit Tokyo"
    assert item.user_id == user.id


def test_bucket_item_create_model(session):
    item = models.BucketItemCreate(
        name="Haunted Forest",
        country="Romania",
        city="Cluj-Napoca",
        category="Adventure",
        description="Experience the horrors"
    )
    assert item.name == "Haunted Forest"
    assert item.country == "Romania"
    assert item.visited is False


def test_bucket_item_update__model(session):
    item = models.BucketItemUpdate(
        name="Visit Paris",
        country="France",
        category="Historical",
        description="A beautiful city in France"
    )
    assert item.name == "Visit Paris"
    assert item.country == "France"
    assert item.city is None
    assert item.visited is None


def test_bucket_item_read_model(session):
    user = User(username="testuser", password_hash="hashedpw")
    session.add(user)
    session.commit()
    session.refresh(user)

    item = models.BucketItemRead(
        id=1,
        name="tester",
        country="somewhere",
        city="pretty",
        category="Historical",
        description="A beautiful place to visit",
        user_id=user.id
    )
    assert item.id == 1
    assert item.category == "Historical"
    assert item.description == "A beautiful place to visit"
    assert item.visited is False
    assert item.user_id == user.id


def test_user_base_model():
    user = models.UserBase(username="test")
    assert user.username == "test"
    assert user.role == "user"


def test_user_model():
    user = models.User(username="test", password_hash="<PASSWORD>")
    assert user.username == "test"
    assert user.password_hash == "<PASSWORD>"


def test_user_model_unique_username(session):
    user1 = models.User(username="test", password_hash="<PASSWORD>")
    session.add(user1)
    session.commit()
    session.refresh(user1)
    user2 = models.User(username="test", password_hash="<PASSWORD>")
    session.add(user2)
    with pytest.raises(IntegrityError):
        session.commit()


def test_user_create_model_correct_input():
    data = {
        "username": "john_doe",
        "password": "Valid123!"
    }
    user = models.UserCreate(**data)
    assert user.username == "john_doe"
    assert user.password == "Valid123!"


@pytest.mark.parametrize("bad_password", [
    "short1!",  # Too short
    "alllowercase1!",  # No uppercase
    "ALLUPPERCASE1!",  # No lowercase
    "NoSpecial123",  # No special character
    "NoNumber!",  # No digit
    "12345678!",  # No letter
])
def test_invalid_passwords_raise_validation_error(bad_password):
    with pytest.raises(ValidationError) as exc_info:
        models.UserCreate(username="john_doe", password=bad_password)

    error_msg = str(exc_info.value)
    assert (
            "Password must be at least 8 characters"
            in error_msg
    ), f"Failed for password: {bad_password}\nActual error: {error_msg}"


@pytest.mark.parametrize("field,value", [
    ("username", "string"),
    ("password", "string"),
])
def test_user_update_model_default_value(field, value):
    data = {field: value}
    user_update = models.UserUpdate(**data)
    assert getattr(user_update, field) is None


@pytest.mark.parametrize("valid_password", [
    "StrongPass1!",  # Meets all requirements
])
def test_user_update_model_password(valid_password):
    user_update = models.UserUpdate(password=valid_password)
    assert user_update.password == valid_password


@pytest.mark.parametrize("invalid_password", [
    "weak",  # Too short
    "NoSpecial123",  # No special
    "NOLOWER123!",  # No lowercase
    "noupper123!",  # No uppercase
    "NoDigit!!",  # No digit
])
def test_user_update_model_invalid_password(invalid_password):
    with pytest.raises(ValidationError):
        models.UserUpdate(password=invalid_password)


def test_password_can_be_none():
    user_update = models.UserUpdate(password=None)
    assert user_update.password is None


def test_user_login_model():
    login = models.UserLogin(username="johndoe", password="secret123")
    assert login.username == "johndoe"
    assert login.password == "secret123"


def test_user_read_model():
    user = models.UserRead(id=1, username="alice", role="admin")
    assert user.id == 1
    assert user.username == "alice"
    assert user.role == "admin"
