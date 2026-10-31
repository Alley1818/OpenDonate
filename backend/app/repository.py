from backend.app.models import Post
from sqlalchemy import select
from backend.app.schemas import PostCreate
from sqlalchemy.orm import Session


class PostRepository:
    @staticmethod
    def add_post(data: PostCreate, author_id: int, db: Session) -> Post:
        post = Post(
            **data.model_dump(),
            author_id=author_id
        )
        db.add(post)
        db.commit()
        db.refresh(post)
        return post

    @classmethod
    def get_posts(cls, db: Session) -> list[Post]:
        query = select(Post)
        result = db.execute(query)
        return list(result.scalars().all())