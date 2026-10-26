from fastapi import APIRouter
from backend.app.repository import PostRepository
from backend.app.schemas import Post, PostCreate, PostResponse


router = APIRouter(
   prefix="/posts",
   tags=["posts"]
)

@router.post("", response_model=PostResponse)
async def add_post(data: PostCreate):
    post_id = await PostRepository.add_post(data)
    return {"post_id": post_id, "title": data.title, "content": data.content}

@router.get("")
async def get_posts() -> list[Post]:
   tasks = await PostRepository.get_posts()
   return tasks

