from pydantic import BaseModel,ConfigDict,Field


class PostCreate(BaseModel):
    title: str
    content: str


class Post(PostCreate):
    post_id: int
    model_config = ConfigDict(from_attributes=True)

class PostResponse(BaseModel):
    post_id: int
    title: str
    content: str | None = None
    class Config:
        from_attributes = True