import pytest
from sqlmodel import SQLModel, create_engine, Session

from app.Repository.UserManager import UserManager

# Setup in-memory SQLite and create tables
@pytest.fixture(scope="module")
def engine():
    engine = create_engine(
        "sqlite:///:memory:",
        echo=False,
        connect_args={"check_same_thread": False}
    )
    SQLModel.metadata.create_all(engine)
    return engine

@pytest.fixture()
def session(engine):
    with Session(engine) as session:
        yield session

@pytest.fixture()
def manager(session):
    return UserManager(session)

@pytest.fixture()
def sample_user(manager):
    # Create or retrieve a user for auth/update/delete tests
    username = "alice"
    password = "Password1!"
    try:
        return manager.create_user(username, password)
    except ValueError:
        # If already exists, fetch via authenticate
        user = manager.authenticate_user(username, password)
        assert user is not None, "Sample user exists but cannot authenticate"
        return user

# 1) Test create_user success

def test_create_user_success(manager):
    user = manager.create_user("bob", "StrongPass1@")
    assert user.id is not None
    assert user.username == "bob"
    assert user.password_hash.startswith("$2b$")

# 2) Test create_user duplicate

def test_create_user_duplicate(manager):
    manager.create_user("charlie", "Another1#")
    with pytest.raises(ValueError) as exc:
        manager.create_user("charlie", "DiffPass2$")
    assert "exists" in str(exc.value)

# 3) Test authenticate_user success

def test_authenticate_user_success(manager, sample_user):
    user = manager.authenticate_user(sample_user.username, "Password1!")
    assert user is not None
    assert user.username == sample_user.username

# 4) Test authenticate_user wrong password

def test_authenticate_user_wrong_password(manager, sample_user):
    user = manager.authenticate_user(sample_user.username, "WrongPass!")
    assert user is None

# 5) Test authenticate_user non-existent

def test_authenticate_user_nonexistent(manager):
    user = manager.authenticate_user("doesnotexist", "Whatever1!")
    assert user is None

# 6) Test get_user_by_id

def test_get_user_by_id(manager, sample_user):
    fetched = manager.get_user_by_id(sample_user.id)
    assert fetched.id == sample_user.id
    assert fetched.username == sample_user.username

# 7) Test update_user username only

def test_update_user_username(manager, sample_user):
    updated = manager.update_user(sample_user.id, username="alice2")
    assert updated.username == "alice2"
    # password remains valid
    auth = manager.authenticate_user("alice2", "Password1!")
    assert auth is not None

# 8) Test update_user password only

def test_update_user_password(manager, sample_user):
    old_hash = sample_user.password_hash
    updated = manager.update_user(sample_user.id, password="NewPass2$")
    assert updated.password_hash != old_hash
    auth = manager.authenticate_user(updated.username, "NewPass2$")
    assert auth is not None

# 9) Test update_user not found

def test_update_user_not_found(manager):
    with pytest.raises(ValueError):
        manager.update_user(9999, username="nobody")

# 10) Test delete_user success

def test_delete_user_success(manager):
    user = manager.create_user("dave", "DavePass4$")
    assert manager.delete_user(user.id) is True
    assert manager.get_user_by_id(user.id) is None

# 11) Test delete_user not found

def test_delete_user_not_found(manager):
    assert manager.delete_user(12345) is False

