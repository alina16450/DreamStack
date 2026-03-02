from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session
from datetime import datetime, timedelta

from app.Service.database import get_session
from app.Service.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

SECRET_KEY = '2X5Fz8mDdLEFpgM7c8V-kFjs8bW1bPgEXb-FsI5cd0Y'
ALGORITHM = "HS256"


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    print(" [create_access_token] payload:", to_encode)
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(" [create_access_token] token:", token)
    return token


def get_current_user(
        token: str = Depends(oauth2_scheme),
        session: Session = Depends(get_session),
) -> User:
    print(" [get_current_user] received token:", token)
    creds_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(" [get_current_user] decoded payload:", payload)
        sub = payload.get("sub")
        if sub is None:
            print("   – missing sub claim")
            raise creds_exc
        user_id = int(sub)
    except (JWTError, ValueError) as e:
        print("   – decode error:", e)
        raise creds_exc

    user = session.get(User, user_id)
    if not user:
        print(f" – no user with id={user_id}")
        raise creds_exc

    print(" got user:", user)
    return user


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password):
    return pwd_context.hash(password)
