from sqlmodel import Session, select
from app.Service.models import BucketItem
from sqlalchemy import desc


class BucketListManager:

    def __init__(self, session: Session):
        self.session = session

    def add_item(self, name, country, city, category, description, user_id: int):
        item = BucketItem(
            name=name,
            country=country,
            city=city,
            category=category,
            description=description,
            user_id=user_id
        )
        self.session.add(item)
        self.session.commit()
        self.session.refresh(item)
        return item

    def get_items(self, user_id: int, filters: dict = None, sort_key: str = None, reverse: bool = False):
        query = select(BucketItem).where(BucketItem.user_id == user_id)

        if filters:
            if "category" in filters:
                query = query.where(BucketItem.category.ilike(filters["category"]))
            if "visited" in filters:
                visited_val = filters["visited"]
                if isinstance(visited_val, str):
                    visited_val = visited_val.lower() == "true"
                query = query.where(BucketItem.visited == visited_val)

        if sort_key in {"name", "country", "city", "category", "visited"}:
            sort_column = getattr(BucketItem, sort_key)
            if reverse:
                sort_column = desc(sort_column)
            query = query.order_by(sort_column)

        return self.session.exec(query).all()

    def get_item_by_id(self, id_: int) -> BucketItem | None:
        return self.session.get(BucketItem, id_)

    def get_items_by_user_id(self, user_id: int):
        statement = select(BucketItem).where(BucketItem.user_id == user_id)
        return self.session.exec(statement).all()

    def update_item(self, id_, name=None, country=None, city=None, category=None, description=None):
        item = self.get_item_by_id(id_)
        if not item:
            raise ValueError("Item not found")

        try:
            print(f"Updating item {id_}:")

            if name is not None and name != "string":
                if name != item.name:
                    print(f"Updating name from {item.name} to {name}")
                    item.name = name  # property setter
                else:
                    print(f"Name unchanged: {name}")

            if country is not None and country != "string":
                if country != item.country:
                    print(f"Updating country from {item.country} to {country}")
                    item.country = country
                else:
                    print(f"Country unchanged: {country}")

            if city is not None and city != "string":
                if city != item.city:
                    print(f"Updating city from {item.city} to {city}")
                    item.city = city
                else:
                    print(f"City unchanged: {city}")

            if category is not None and category != "string":
                if category != item.category:
                    print(f"Updating category from {item.category} to {category}")
                    item.category = category
                else:
                    print(f"Category unchanged: {category}")

            if description is not None and description != "string":
                if description != item.description:
                    print(f"Updating description from {item.description} to {description}")
                    item.description = description
                else:
                    print(f"Description unchanged: {description}")
            self.session.add(item)
            self.session.commit()
            self.session.refresh(item)
            return item
        except ValueError as e:
            print(f"Error updating item: {e}")
            return None

    def update_visited(self, item_id: int) -> BucketItem | None:
        item = self.get_item_by_id(item_id)
        if not item:
            return None
        item.visited = not item.visited
        self.session.add(item)
        self.session.commit()
        self.session.refresh(item)
        return item

    def delete_item(self, id_: int) -> bool:
        item = self.get_item_by_id(id_)
        if item:
            self.session.delete(item)
            self.session.commit()
            return True
        return False
