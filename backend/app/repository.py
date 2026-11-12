from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from backend.app.models import Post, PostImage
from backend.app.schemas import PostCreate, PostUpdate
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from backend.app.models import Post, PostImage
from backend.app.services.image_service import save_image, UPLOAD_DIR

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
    def get_posts(cls, db: Session, limit: int, offset: int) -> list[Post]:
        stmt = (
            select(Post)
            .options(joinedload(Post.author))
            .order_by(Post.created_at.desc(),Post.id.desc())
            .limit(limit)
            .offset(offset)
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

    @classmethod
    def upload_image(
            cls,
            post_id: int,
            file_bytes: bytes,
            author_id: int,
            db: Session,
    ) -> PostImage | None:

        stmt = select(Post).where(
            Post.id == post_id,
            Post.author_id == author_id,
        )

        post = db.execute(stmt).scalar_one_or_none()

        if post is None:
            return None

        image_count = db.scalar(
            select(func.count())
            .select_from(PostImage)
            .where(PostImage.post_id == post_id)
        )

        if image_count >= 5:
            raise ValueError("Maximum 5 images per post")

        file_path = save_image(file_bytes)

        try:
            image = PostRepository.upload_image(
                post_id=post_id,
                file_bytes=file_bytes,
                author_id=author_id,
                db=db,
            )
        except ValueError as error:
            raise HTTPException(
                status_code=409,
                detail=str(error),
            ) from error

        db.add(image)

        try:
            db.commit()
            db.refresh(image)
        except Exception:
            db.rollback()

            (UPLOAD_DIR.parent.parent / file_path).unlink(missing_ok=True)

            raise

        return image