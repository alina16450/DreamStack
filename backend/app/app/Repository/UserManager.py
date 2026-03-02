from sqlalchemy.exc import IntegrityError
from app.Service.models import User
from app.Service.Auth import hash_password, verify_password
from sqlmodel import Session, select


class UserManager:
    def __init__(self, session: Session):
        self.session = session

    def create_user(self, username: str, password: str):
        exists = (self.session.exec(select(User).where(User.username == username)).first())
        if exists:
            raise ValueError("User already exists")

        password_hash = hash_password(password)
        user = User(username=username, password_hash=password_hash)
        try:
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)
        except IntegrityError:
            self.session.rollback()
            raise ValueError("Username already taken")

        return user

    def authenticate_user(self, username: str, password: str):
        self.session.expire_all()
        statement = select(User).where(User.username == username)
        user = self.session.exec(statement).first()
        if user:
            print("Stored hash:", user.password_hash)
            print("Password matches:", verify_password(password, user.password_hash))
        if not user or not verify_password(password, user.password_hash):
            return None
        return user

    def get_user_by_id(self, user_id):
        return self.session.get(User, user_id)

    def update_user(self, user_id, username=None, password=None):
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        print(
            f"Updating user {user_id} with username='{username}' and password={'provided' if password else 'not provided'}")
        if username and username.strip() and username != "string":
            user.username = username

        if password and password.strip() and password != "string":
            user.password_hash = hash_password(password)

        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        self.session.expire_all()
        return user

    def delete_user(self, user_id):
        user = self.get_user_by_id(user_id)
        if user:
            self.session.delete(user)
            self.session.commit()
            return True
        return False

    def toggle_role(self, user_id):
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        user.toggle_role()
        self.session.commit()
        return user
