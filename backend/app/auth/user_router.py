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
<<<<<<< Updated upstream
    return UserRepository.login(creds=creds, db=db, response=response)
=======
    return UserRepository.login(creds=creds, db=db, response=response)


@user_router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response):
    security.unset_cookies(response)
    return None


@user_router.get("/me", status_code=200)
def get_me(payload: TokenPayload = Depends(security.access_token_required), db: Session = Depends(get_db)) -> UserResponse:
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
>>>>>>> Stashed changes
