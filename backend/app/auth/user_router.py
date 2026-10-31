from fastapi import APIRouter, Depends, Response
from backend.app.db import get_db
from backend.app.schemas import UserCreate, UserLogin
from backend.app.auth.user_repository import UserRepository

user_router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@user_router.post("/register", status_code=201)
def register_post(data: UserCreate, response: Response, db = Depends(get_db)):
    return UserRepository.create_user(data=data, db=db, response=response)


@user_router.post("/login", status_code=200)
def login(creds: UserLogin, response: Response, db = Depends(get_db)):
    return UserRepository.login(creds=creds, db=db, response=response)