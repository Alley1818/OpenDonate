from backend.app.db import get_db
from backend.app.models import Post
from sqlalchemy import select
from backend.app.schemas import PostResponse,PostCreate

class PostRepository:
    @classmethod
    async def add_post(cls, data: PostCreate) -> int:
       async with get_db() as session:
           data = data.model_dump()
           new_post = Post(**data)
           session.add(new_post)
           await session.flush()
           await session.commit()
           return new_post.post_id


    @classmethod
    async def get_posts(cls) -> list[PostResponse]:
           async with get_db() as session:
               query = select(Post)
               result = await session.execute(query)
               post_models = result.scalars().all()
               posts = [PostResponse.model_validate(post) for post in post_models]
               return posts

