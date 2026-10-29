from backend.app.db import get_db
from backend.app.models import User
from sqlalchemy import select
from backend.app.schemas import UserCreate,UserResponse
from backend.app.security import hash_password


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
