from datetime import datetime

from pydantic import BaseModel, ConfigDict
from backend.app.models import PostVisibility


class UserName(BaseModel):
    username: str


class UserCreate(BaseModel):
    email: str
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    username: str
    display_name: str | None
    is_active: bool


class AuthorResponse(BaseModel):
    id: int
    username: str
    display_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class PostCreate(BaseModel):
    title: str
    content: str
    visibility: PostVisibility = PostVisibility.public


class PostUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    visibility: PostVisibility | None = None


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int
    title: str
    content: str
    visibility: PostVisibility
    created_at: datetime
    updated_at: datetime
    author: AuthorResponse