from backend.app.db import get_db
from backend.app.models import User
from backend.app.schemas import UserCreate, UserResponse
from backend.app.auth.security import hash_password
from sqlalchemy import select
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.exc import IntegrityError
from typing import Annotated


class UserRepository:
    @classmethod
    async def create_user(cls, data: UserCreate) -> int:
       async with get_db() as session:
           user = User(
               email = data.email,
               username = data.username,
               password_hash = hash_password(data.password),
           )
           session.add(user)
           await session.flush()
           user_id = user.id
           await session.commit()
           return user_id

    @classmethod
    async def get_user(cls, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> User:
        async with get_db() as session:
            query = select(form_data.username).limit(1)
            user_dict = await session.execute(query)
            if not user_dict:
                raise HTTPException(status_code=400, detail="Incorrect username or password")
            user = UserResponse(**user_dict)
            hashed_password = form_data.password
            if hashed_password != user.hashed_password:
                raise HTTPException(status_code=400, detail="Incorrect username or password")

            return {"access_token": user.username, "token_type": "bearer"}