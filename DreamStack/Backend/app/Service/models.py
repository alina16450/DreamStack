import re

from sqlalchemy import Column, String
from sqlmodel import SQLModel, Field
from typing import Optional, List
from sqlmodel import Relationship
from pydantic import validator

class BucketItemBase(SQLModel):
    name: str
    country: str
    city: str
    category: str
    description: Optional[str] = None
    visited: bool = False

class BucketItem(BucketItemBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    user: Optional["User"] = Relationship(back_populates="bucket_items")

class BucketItemCreate(BucketItemBase):
    visited: Optional[bool] = False

class BucketItemUpdate(SQLModel):
    name: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    visited: Optional[bool] = None
    user_id: Optional[int] = None

class BucketItemRead(BucketItemBase):
    id: int
    user_id: int

# Shared base
class UserBase(SQLModel):
    username: str
    role: str = "user"

# Table model
class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(sa_column=Column("username", String, unique=True, index=True))
    password_hash: str

    bucket_items: List["BucketItem"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

# Create model
class UserCreate(SQLModel):
    username: str
    password: str = Field(..., description="Must have upper, lower, number, special")

    @validator("password")
    def password_strength(cls, v: str) -> str:
        pattern = re.compile(
            r"^(?=[^a-z]*[a-z])"  # at least one lowercase
            r"(?=[^A-Z]*[A-Z])"  # at least one uppercase
            r"(?=\D*\d)"  # at least one digit
            r"(?=[A-Za-z0-9]*[^A-Za-z0-9])"  # at least one special
            r".{8,}$"  # allowed chars, min length 8
        )
        if not pattern.match(v):
            raise ValueError(
                "Password must be at least 8 characters, "
                "contain upper & lower case letters, a digit, and a special character"
            )
        return v

class UserRead(SQLModel):
    id: int
    username: str
    role: str

# Update model
class UserUpdate(SQLModel):
    username: Optional[str] = None
    password: Optional[str] = None

    @validator("username", "password", pre=True)
    def ignore_string_default(cls, v):
        if v == "string":
            return None
        return v

    @validator("password")
    def password_strength_on_update(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        return UserCreate.password_strength(v)

class UserLogin(SQLModel):
    username: str
    password: str
