from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from backend.app.models import Post
from backend.app.schemas import PostCreate, PostUpdate


class PostRepository:

    @staticmethod
    def add_post(
        data: PostCreate,
        author_id: int,
        db: Session
    ) -> Post:
        post = Post(
            **data.model_dump(),
            author_id=author_id
        )

        db.add(post)
        db.commit()
        db.refresh(post)

        return post