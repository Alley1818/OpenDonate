from backend.app.db import get_db
from backend.app.models import Post
from sqlalchemy import select
<<<<<<< Updated upstream
from backend.app.schemas import PostResponse,PostCreate
=======
from backend.app.schemas import PostCreate, PostUpdate, PostResponse
from sqlalchemy.orm import Session, joinedload

>>>>>>> Stashed changes

class PostNotFound(Exception):
    pass

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

<<<<<<< Updated upstream
=======
    @classmethod
    def get_post_by_id(cls, db: Session, id: int) -> Post | None:
        post_id = int(id)
        stmt = select(Post).where(Post.id==post_id).options(joinedload(Post.author))
        return db.execute(stmt).scalar_one_or_none()

    @classmethod
    def change_post(cls, id, data: PostUpdate, author_id:int, db: Session) -> PostResponse:
        post_id = int(id)
        tmst = select(Post).where((Post.id == post_id) & (Post.author_id == author_id)).options(joinedload(Post.author))
        post_to_update = db.execute(tmst).scalar_one_or_none()
        if not post_to_update:
            raise PostNotFound("Задача не найдена")
        new_post = data.model_dump(exclude_unset=True)
        for field, value in new_post.items():
            setattr(post_to_update, field, value)
        db.add(post_to_update)
        db.commit()
        db.refresh(post_to_update)
        return PostResponse.model_validate(post_to_update)
>>>>>>> Stashed changes
