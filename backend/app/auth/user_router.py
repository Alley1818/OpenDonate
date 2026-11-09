from authx import TokenPayload
from sqlalchemy.orm import Session
from .security import security
from fastapi import APIRouter, Depends, Response, HTTPException,status
from backend.app.db import get_db
from backend.app.schemas import UserCreate, UserLogin, UserResponse, CreatorUpdate
from backend.app.auth.user_repository import UserRepository

user_router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

creator_router = APIRouter(
    prefix="/creators",
    tags=["Creators"]
)

@user_router.post("/register", status_code=201)
def register_post(data: UserCreate, response: Response, db = Depends(get_db)):
    return UserRepository.create_user(
        data=data, db=db, response=response
    )


@user_router.post("/login", status_code=200)
def login(creds: UserLogin, response: Response, db = Depends(get_db)):
    return UserRepository.login(
        creds=creds, db=db, response=response
    )


@user_router.post("/logout")
async def logout(response: Response):
    security.unset_cookies(response)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@user_router.get("/me", status_code=200)
def get_me(payload: TokenPayload = Depends(security.access_token_required), db: Session = Depends(get_db)):
    id = int(payload.sub)
    user = UserRepository.get_user_by_id(id, db=db)
    if user is None:
        raise HTTPException(status_code=401, detail="User not authorized")
    return user

@creator_router.get("/{username}", status_code=200)
def get_by_username(
    username: str, db: Session = Depends(get_db)) -> UserResponse:
  user = UserRepository.get_by_username(username=username, db=db)
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  return user



@creator_router.patch("/me", status_code=200)
def edit_profile(
    data: CreatorUpdate,
    db: Session = Depends(get_db),
    payload: TokenPayload = Depends(security.access_token_required)
)  -> UserResponse:
    update_data = data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    user = UserRepository.edit_profile(
            id=int(payload.sub),
            data=data,
            db=db)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user