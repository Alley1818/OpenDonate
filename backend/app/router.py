<<<<<<< Updated upstream
from fastapi import APIRouter
from backend.app.repository import PostRepository
from backend.app.schemas import PostCreate, PostResponse
=======
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.repository import PostRepository
from backend.app.schemas import PostCreate, PostResponse, PostUpdate
from authx import TokenPayload
from backend.app.auth.security import security
from backend.app.db import get_db
>>>>>>> Stashed changes


router = APIRouter(
   prefix="/posts",
   tags=["posts"]
)

@router.post("", response_model=PostResponse, status_code=201)
<<<<<<< Updated upstream
async def add_post(data: PostCreate):
    post_id = await PostRepository.add_post(data)
    return {"post_id": post_id, "title": data.title, "content": data.content}

@router.get("")
async def get_posts() -> list[PostResponse]:
   tasks = await PostRepository.get_posts()
   return tasks
=======
def add_post(data: PostCreate, payload:TokenPayload=Depends(security.access_token_required), db : Session=Depends(get_db)):
    author_id = int(payload.sub)
    post = PostRepository.add_post(
        data=data,
        author_id=author_id,
        db=db
    )
    return post

@router.get("")
def get_posts(db = Depends(get_db)) -> list[PostResponse]:
   posts = PostRepository.get_posts(db=db)
   return posts

@router.get("/{id}", response_model=PostResponse)
def get_post_by_id(id ,db = Depends(get_db)) -> list[PostResponse]:
   post = PostRepository.get_post_by_id(id=id, db=db)
   if not post:
       raise HTTPException(status_code=404, detail="Post not found")
   return post

@router.patch("/{id}", response_model=PostResponse)
def change_post(id: int, data: PostUpdate, payload:TokenPayload=Depends(security.access_token_required), db = Depends(get_db))-> PostResponse:
    author_id = int(payload.sub)
    post = PostRepository.change_post(id=id, author_id=author_id, db=db, data=data)
    return post
>>>>>>> Stashed changes
