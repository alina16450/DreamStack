import pytest
from fastapi.testclient import TestClient

from app import main
from app.main import app, get_current_user, get_bucketlist_manager, get_user_manager, get_session
from app.Service.models import User as ServiceUser

# Dummy data classes
class DummyUser:
    def __init__(self, id=1, username="testuser", role="user"):
        self.id = id
        self.username = username
        self.role = role

class DummyItem:
    def __init__(self, id, name, country, city, category, description, visited, user_id):
        self.id = id
        self.name = name
        self.country = country
        self.city = city
        self.category = category
        self.description = description
        self.visited = visited
        self.user_id = user_id

    def dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "country": self.country,
            "city": self.city,
            "category": self.category,
            "description": self.description,
            "visited": self.visited,
            "user_id": self.user_id,
        }

class DummyBucketManager:
    def __init__(self):
        self.sample = DummyItem(
            id=1, name="Visit Paris", country="France", city="Paris",
            category="Travel", description="See the Eiffel Tower",
            visited=False, user_id=1
        )

    def get_items(self, user_id, filters, sort_key, reverse):
        return [self.sample]

    def get_item_by_id(self, item_id):
        return self.sample if item_id == 1 else None

    def update_item(self, item_id, name=None, country=None, city=None, category=None, description=None):
        data = self.sample.dict()
        for k, v in {"name": name, "country": country, "city": city, "category": category, "description": description}.items():
            if v is not None:
                data[k] = v
        return DummyItem(**data)

    def update_visited(self, item_id):
        orig = self.sample
        return DummyItem(
            id=orig.id, name=orig.name, country=orig.country, city=orig.city,
            category=orig.category, description=orig.description,
            visited=not orig.visited, user_id=orig.user_id
        )

    def add_item(self, name, country, city, category, description, user_id):
        return DummyItem(
            id=2, name=name, country=country, city=city,
            category=category, description=description,
            visited=False, user_id=user_id
        )

    def delete_item(self, item_id):
        return item_id == 1

class DummyUserManager:
    def __init__(self, session=None): pass
    def create_user(self, username, password):
        if username == "exists":
            raise ValueError("User already exists")
        return ServiceUser(id=1, username=username, role="user", password_hash="hashed")
    def authenticate_user(self, username, password):
        return DummyUser(id=1, username=username) if username == "test" and password == "pass" else None
    def get_user_by_id(self, user_id):
        return DummyUser(id=1, username="testuser") if user_id == 1 else None
    def delete_user(self, user_id):
        return True

class DummyDBUser:
    def __init__(self):
        self.id = 1
        self.username = "olduser"
        self.role = "user"
        self.password_hash = "oldhash"

class DummySession:
    def __init__(self):
        self._user = DummyDBUser()

    def get(self, model, id_):
        return self._user if id_ == 1 else None

    def add(self, obj):
        # No-op
        pass

    def commit(self):
        # No-op
        pass

    def refresh(self, obj):
        # Simulate refresh by reassigning
        pass

@pytest.fixture(autouse=True)
def override_dependencies(monkeypatch):
    app.dependency_overrides[get_current_user] = lambda: DummyUser()
    app.dependency_overrides[get_bucketlist_manager] = lambda: DummyBucketManager()
    app.dependency_overrides[get_user_manager] = lambda: DummyUserManager()
    app.dependency_overrides[get_session] = lambda: DummySession()
    monkeypatch.setattr(main, 'create_access_token', lambda data, expires_delta: "token123")
    monkeypatch.setattr(main, 'UserManager', DummyUserManager)
    yield
    app.dependency_overrides.clear()

client = TestClient(app)

# Tests

def test_cors_test():
    r = client.get("/cors-test")
    assert r.status_code == 200


def test_get_all():
    r = client.get("/", headers={"Authorization": "Bearer token123"})
    assert r.status_code == 200


def test_update_item_success():
    r = client.put(
        "/edit/1",
        json={"name": "Visit London"},
        headers={"Authorization": "Bearer token123"}
    )
    assert r.status_code == 200
    assert r.json()["name"] == "Visit London"


def test_update_item_not_found():
    r = client.put(
        "/edit/999",
        json={"name": "Visit London"},
        headers={"Authorization": "Bearer token123"}
    )
    assert r.status_code == 404


def test_toggle_visited():
    r = client.put("/items/1/visited", headers={"Authorization": "Bearer token123"})
    assert r.status_code == 200
    assert r.json()["visited"] is True


def test_create_item():
    payload = {"name": "New Place", "country": "USA", "city": "NYC", "category": "Fun", "description": "Test"}
    r = client.post("/add", json=payload, headers={"Authorization": "Bearer token123"})
    assert r.status_code == 200
    assert r.json()["id"] == 2


def test_delete_item_success():
    r = client.delete("/delete/1", headers={"Authorization": "Bearer token123"})
    assert r.status_code == 200
    assert r.json()["message"] == "Item deleted"


def test_delete_item_not_found():
    r = client.delete("/delete/999", headers={"Authorization": "Bearer token123"})
    assert r.status_code == 404


def test_register_success():
    # Use a password that meets strength requirements
    payload = {"username": "newuser", "password": "StrongPass1!"}
    r = client.post("/register", json=payload)
    assert r.status_code == 200
    assert r.json()["username"] == "newuser"


def test_register_conflict():
    # Use a valid strong password even for conflict test
    payload = {"username": "exists", "password": "StrongPass1!"}
    r = client.post("/register", json=payload)
    assert r.status_code == 400


def test_login_success():
    r = client.post("/login", data={"username": "test", "password": "pass"})
    assert r.status_code == 200
    assert r.json()["access_token"] == "token123"
    assert r.json()["token_type"] == "bearer"


def test_login_failure():
    r = client.post("/login", data={"username": "bad", "password": "creds"})
    assert r.status_code == 401


def test_update_user():
    r = client.put(
        "/user",
        json={"username": "updateduser"},
        headers={"Authorization": "Bearer token123"}
    )
    assert r.status_code == 200
    assert r.json()["username"] == "updateduser"


def test_delete_self():
    r = client.delete("/user", headers={"Authorization": "Bearer token123"})
    assert r.status_code == 200
    assert r.json()["message"] == "Your account has been deleted"
