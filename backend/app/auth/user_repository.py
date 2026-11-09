from fastapi import HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session
from backend.app.models import User
from backend.app.schemas import UserCreate, UserLogin, CreatorUpdate
from backend.app.auth.security import hash_password, verify_password, security


class UserRepository:
    @classmethod
    def create_user(cls, data: UserCreate, db: Session, response: Response) -> dict:
        user = User(
            email=data.email,
            username=data.username,
            password_hash=hash_password(data.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = security.create_access_token(uid=str(user.id))
        security.set_access_cookies(token, response, max_age=86640)
        return {
            "message": "User registered successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }

    @classmethod
    def login(cls, creds: UserLogin, db: Session, response: Response) -> dict:
        stmt = select(User).where(User.username == creds.username)
        user = db.execute(stmt).scalar_one_or_none()

        if not user or not verify_password(creds.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Incorrect username or password")

        token = security.create_access_token(uid=str(user.id))
        security.set_access_cookies(token, response)
        return {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }

    @classmethod
    def get_user_by_id(cls, id:int, db: Session) -> User | None:
        stmt = select(User).where(User.id == id)
        user = db.execute(stmt).scalar_one_or_none()
        return user


    @classmethod
    def get_by_username(cls, username: str, db: Session) -> User | None:
        stmt = select(User).where(User.username == username)
        user = db.execute(stmt).scalar_one_or_none()
        return user

    @classmethod
    def edit_profile(cls, id: int, db: Session, data: CreatorUpdate) -> User | None:
        stmt = select(User).where(User.id == id)
        user = db.execute(stmt).scalar_one_or_none()

        if user is None:
            return None

        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(user, field, value)

        db.commit()
        db.refresh(user)
        return user