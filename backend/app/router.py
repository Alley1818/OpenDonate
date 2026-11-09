from fastapi import APIRouter, Depends, HTTPException
from authx import TokenPayload
from fastapi import Query
from backend.app.repository import PostRepository
from backend.app.schemas import (
    PostCreate,
    PostUpdate,
    PostResponse
)
from backend.app.db import get_db
from backend.app.auth.security import security


router = APIRouter(
    prefix="/posts",
    tags=["posts"]
)


@router.post("", response_model=PostResponse, status_code=201)
def add_post(
    data: PostCreate,
    db=Depends(get_db)
):
    post = PostRepository.add_post(
        data=data,
        author_id=1,
        db=db
    )

    return post


@router.get("", response_model=list[PostResponse], status_code=200)
def get_posts(db=Depends(get_db),  offset: int = Query(0, ge=0),
              limit: int = Query(10, ge=1, le=100),):
    posts = PostRepository.get_posts(
        limit=limit,
        offset=offset,
        db=db,
    )
    return posts


@router.get("/{id}", response_model=PostResponse)
def get_post_by_id(
    id: int,
    db=Depends(get_db)
):
    post = PostRepository.get_post_by_id(
        id=id,
        db=db
    )

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    return post


@router.patch("/{id}", response_model=PostResponse)
def change_post(
    id: int,
    data: PostUpdate,
    payload: TokenPayload = Depends(security.access_token_required),
    db=Depends(get_db)
):
    author_id = int(payload.sub)

    update_data = data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    if any(value is None for value in update_data.values()):
        raise HTTPException(
            status_code=422,
            detail="Fields cannot be null"
        )

    post = PostRepository.change_post(
        id=id,
        author_id=author_id,
        data=data,
        db=db
    )

    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    return post