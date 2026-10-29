from fastapi import APIRouter

from backend.app.schemas import UserResponse, UserCreate
from backend.app.user_repository import UserRepository

registration = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@registration.post("/register", response_model=UserResponse, status_code=201)
async def register_post(data: UserCreate):
    try:
        user_id =  await UserRepository.create_user(data)
    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Email или username уже заняты",
        )