from backend.app.db import PostOrm, new_session
from sqlalchemy import select
from backend.app.schemas import Post,PostCreate

class PostRepository:
    @classmethod
    async def add_post(cls, data: PostCreate) -> int:
       async with new_session() as session:
           data = data.model_dump()
           new_post = PostOrm(**data)
           session.add(new_post)
           await session.flush()
           await session.commit()
           return new_post.post_id


    @classmethod
    async def get_posts(cls) -> list[Post]:
           async with new_session() as session:
               query = select(PostOrm)
               result = await session.execute(query)
               post_models = result.scalars().all()
               posts = [Post.model_validate(post) for post in post_models]
               return posts

