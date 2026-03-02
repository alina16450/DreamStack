import traceback
from datetime import timedelta
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware

from fastapi.security import OAuth2PasswordRequestForm

from app.Repository.UserManager import UserManager
from app.Service.Auth import get_current_user, create_access_token, hash_password
from app.Service.models import BucketItem, BucketItemCreate, BucketItemUpdate, UserRead, UserCreate, UserUpdate, \
    User, BucketItemRead
from app.Service.database import get_session, init_db
from sqlmodel import Session

from app.Repository.BucketListManager import BucketListManager


app = FastAPI()

origins = [
    "http://localhost:3000",]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_bucketlist_manager(session: Session = Depends(get_session)):
    return BucketListManager(session)


def get_user_manager(session: Session = Depends(get_session)):
    return UserManager(session)

@app.get("/", response_model=List[BucketItem])
def get_all(
    category: Optional[str] = None,
    visited: Optional[bool] = None,
    sort_key: Optional[str] = None,
    reverse: bool = False,
    current_user: User = Depends(get_current_user),
    manager: BucketListManager = Depends(get_bucketlist_manager),
):
    filters = {}
    if category:
        filters["category"] = category
    if visited is not None:
        filters["visited"] = visited

    try:
        return manager.get_items(
            user_id=current_user.id,
            filters=filters,
            sort_key=sort_key,
            reverse=reverse
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/edit/{item_id}", response_model=BucketItem)
def update_item(
        item_id: int,
        update: BucketItemUpdate,
        current_user: User = Depends(get_current_user),
        manager: BucketListManager = Depends(get_bucketlist_manager)
):
    item = manager.get_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    try:
        updated_item = manager.update_item(
            item_id,
            name=update.name,
            country=update.country,
            city=update.city,
            category=update.category,
            description=update.description,
        )
        updated_item.user_id=current_user.id

        return updated_item
    except ValueError as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/cors-test")
def cors_test():
    return {"message": "CORS is working"}

@app.put("/items/{item_id}/visited", response_model=BucketItem)
def toggle_visited(
    item_id: int,
    current_user: User = Depends(get_current_user),
    manager: BucketListManager = Depends(get_bucketlist_manager),
):
    item = manager.get_item_by_id(item_id)
    if not item or item.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Item not found")
    updated = manager.update_visited(item_id)
    return updated


@app.post("/add", response_model=BucketItemRead)
def create_item(
        item: BucketItemCreate,
        current_user: User = Depends(get_current_user),
        manager: BucketListManager = Depends(get_bucketlist_manager)):
    try:
        new_item = manager.add_item(
            name=item.name,
            country=item.country,
            city=item.city,
            category=item.category,
            description=item.description,
            user_id=current_user.id
        )
        return new_item
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/delete/{item_id}")
def delete_item(
        item_id: int,
        manager: BucketListManager = Depends(get_bucketlist_manager)
):
    try:
        deleted = manager.delete_item(item_id)
        if deleted:
            return {"message": "Item deleted"}
        else:
            raise HTTPException(status_code=404, detail="Item not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/register", response_model=UserRead)
def register(data: UserCreate, manager: UserManager = Depends(get_user_manager)):
    try:
        user = manager.create_user(data.username, data.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return UserRead.from_orm(user)

@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    manager = UserManager(session)
    user = manager.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},)

    print(" [login] authenticated user:", user)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=60),
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/{user_id}", response_model=UserRead)
def get_user(user_id: int, manager: UserManager = Depends(get_user_manager)):
    user = manager.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserRead(id=user.id, username=user.username, role=user.role)


@app.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
    return UserRead.model_validate(current_user)

@app.put("/user", response_model=UserRead)
def update_user(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    user = db.get(User, current_user.id)

    update_dict = {
        k: v for k, v in update_data.model_dump(exclude_unset=True).items() if v is not None
    }

    if "password" in update_dict:
        update_dict["password_hash"] = hash_password(update_dict.pop("password"))

    for key, value in update_dict.items():
        setattr(user, key, value)

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

@app.delete("/user")
def delete_self(
    current_user: User = Depends(get_current_user),
    manager: UserManager = Depends(get_user_manager),
):
    manager.delete_user(current_user.id)
    return {"message": "Your account has been deleted"}


@app.on_event("startup")
async def startup_event():
    print("Starting up the app...")
    init_db()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
