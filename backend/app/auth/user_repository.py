from fastapi import HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session
from backend.app.models import User
from backend.app.schemas import UserCreate, UserLogin
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
        security.set_access_cookies(token, response)
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