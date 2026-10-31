from fastapi import APIRouter, Depends, HTTPException
from backend.app.repository import PostRepository
from backend.app.schemas import PostCreate, PostResponse
from backend.app.db import get_db


router = APIRouter(
   prefix="/posts",
   tags=["posts"]
)

@router.post("", response_model=PostResponse, status_code=201)
def add_post(data: PostCreate, db=Depends(get_db)):
    post = PostRepository.add_post(
        data=data,
        author_id=1,
        db=db
    )
    return post

@router.get("")
def get_posts(db = Depends(get_db)) -> list[PostResponse]:
   tasks = PostRepository.get_posts(db=db)
   return tasks
