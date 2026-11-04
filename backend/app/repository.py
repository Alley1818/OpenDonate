from backend.app.models import Post
from sqlalchemy import select
<<<<<<< Updated upstream
from backend.app.schemas import PostCreate
from sqlalchemy.orm import Session, joinedload

=======
from backend.app.schemas import PostResponse,PostCreate
>>>>>>> Stashed changes

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
        query = select(Post).options(joinedload(Post.author))
        result = db.execute(query)
        return list(result.scalars().all())

<<<<<<< Updated upstream
    @classmethod
    def get_post_by_id(cls, db: Session, id: int) -> Post:
        post_id = int(id)
        stmt = select(Post).where(Post.id==post_id).options(joinedload(Post.author))
        return db.execute(stmt).scalar_one_or_none()
=======
>>>>>>> Stashed changes
