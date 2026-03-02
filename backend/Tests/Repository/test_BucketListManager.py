import pytest
from sqlmodel import SQLModel, create_engine, Session, select

from app.Service.models import User
from app.Repository.BucketListManager import BucketListManager

# In-memory SQLite for testing
@pytest.fixture
def engine():
    engine = create_engine("sqlite:///:memory:", echo=False)
    SQLModel.metadata.create_all(engine)
    return engine

@pytest.fixture
def session(engine):
    with Session(engine) as session:
        # Create a dummy user for foreign-key constraints
        user = User(username="testuser", password_hash="hash")
        session.add(user)
        session.commit()
        session.refresh(user)
        yield session

@pytest.fixture
def manager(session):
    return BucketListManager(session)

@pytest.fixture
def user(session):
    return session.exec(select(User)).first()

def test_add_and_get_item(manager, user):
    # Add an item
    item = manager.add_item(
        name="Place",
        country="Country",
        city="City",
        category="Cat",
        description="Desc",
        user_id=user.id
    )
    assert item.id is not None
    # Retrieve by id
    fetched = manager.get_item_by_id(item.id)
    assert fetched == item
    # Retrieve list
    items = manager.get_items(user_id=user.id)
    assert len(items) == 1
    assert items[0].name == "Place"

def test_update_item(manager, user):
    item = manager.add_item("A", "B", "C", "D", "E", user.id)
    updated = manager.update_item(
        item.id,
        name="AA",
        country="BB",
        city="CC",
        category="DD",
        description="EE"
    )
    assert updated.name == "AA"
    assert updated.country == "BB"
    assert updated.city == "CC"
    assert updated.category == "DD"
    assert updated.description == "EE"

def test_update_item_no_changes(manager, user):
    item = manager.add_item("X", "Y", "Z", "Cat", "Desc", user.id)
    # call update with same values
    updated = manager.update_item(item.id, name="X", country="Y", city="Z", category="Cat", description="Desc")
    assert updated == item

def test_update_item_not_found(manager):
    with pytest.raises(ValueError):
        manager.update_item(999, name="New")

def test_update_visited(manager, user):
    item = manager.add_item("Name", "C", "City", "Cat", "Desc", user.id)
    assert item.visited is False
    toggled = manager.update_visited(item.id)
    assert toggled.visited is True
    toggled_back = manager.update_visited(item.id)
    assert toggled_back.visited is False
    # non-existent
    assert manager.update_visited(999) is None

def test_delete_item(manager, user):
    item = manager.add_item("N", "C", "City", "Cat", "Desc", user.id)
    assert manager.delete_item(item.id) is True
    assert manager.get_item_by_id(item.id) is None
    # deleting again returns False
    assert manager.delete_item(item.id) is False

def test_filters_and_sort(manager, user):
    # Create multiple
    i1 = manager.add_item("Alpha", "One", "O", "Cat1", "D1", user.id)
    i2 = manager.add_item("Bravo", "Two", "T", "Cat2", "D2", user.id)
    i3 = manager.add_item("Charlie", "Three", "H", "Cat1", "D3", user.id)
    # filter category
    filtered = manager.get_items(user_id=user.id, filters={"category": "%Cat1%"})
    assert all("Cat1" in it.category for it in filtered)
    # filter visited (none visited)
    filtered2 = manager.get_items(user_id=user.id, filters={"visited": "false"})
    assert len(filtered2) == 3
    # mark as visited
    manager.update_visited(i2.id)
    filtered3 = manager.get_items(user_id=user.id, filters={"visited": "true"})
    assert filtered3 == [manager.get_item_by_id(i2.id)]
    # sort by name desc
    sorted_items = manager.get_items(user_id=user.id, sort_key="name", reverse=True)
    names = [it.name for it in sorted_items]
    assert names == sorted(names, reverse=True)
