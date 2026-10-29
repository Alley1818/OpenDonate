from fastapi import APIRouter, HTTPException, Depends,status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.exc import IntegrityError
from typing import Annotated
from user_repository import UserRepository
from backend.app.schemas import UserResponse, UserCreate
from backend.app.auth.user_repository import UserRepository

registration = APIRouter(
    prefix="/users",
    tags=["Users"]
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@registration.post("/register", status_code=201)
async def register_post(data: UserCreate):
    try:
        user_id =  await UserRepository.create_user(data)
    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Email или username уже заняты",
        )


@registration.post("/login", response_model=UserResponse, status_code=201)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = UserRepository.get_user(form_data)
    return user