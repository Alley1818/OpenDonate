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

    @classmethod
    def get_posts(cls, db: Session) -> list[Post]:
        stmt = (
            select(Post)
            .options(joinedload(Post.author))
        )

        result = db.execute(stmt)

        return list(result.scalars().all())

    @classmethod
    def get_post_by_id(
        cls,
        id: int,
        db: Session
    ) -> Post | None:
        stmt = (
            select(Post)
            .where(Post.id == id)
            .options(joinedload(Post.author))
        )

        return db.execute(stmt).scalar_one_or_none()

    @classmethod
    def change_post(
        cls,
        id: int,
        author_id: int,
        data: PostUpdate,
        db: Session
    ) -> Post | None:

        stmt = (select(Post).where(Post.id == id,Post.author_id == author_id)
                .options(joinedload(Post.author)))

        post = db.execute(stmt).scalar_one_or_none()

        if post is None:
            return None

        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(post, field, value)

        db.commit()
        db.refresh(post)

        return post