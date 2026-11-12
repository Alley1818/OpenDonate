from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from authx import TokenPayload
from fastapi import Query
from sqlalchemy.orm import Session

from backend.app.repository import PostRepository
from backend.app.schemas import (
    PostCreate,
    PostUpdate,
    PostResponse
)
from backend.app.db import get_db
from backend.app.auth.security import security
from backend.app.services.image_upload import (
    validate_image_size,
    validate_image,
    MAX_IMAGE_SIZE
)

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


@router.post("/posts/{post_id}/images")
async def upload_images(
    post_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    payload: TokenPayload = Depends(security.access_token_required),
):
    author_id = int(payload.sub)

    file_bytes = await file.read(MAX_IMAGE_SIZE + 1)

    if not validate_image_size(file_bytes):
        raise HTTPException(
            status_code=413,
            detail="File size exceeds 5 MB",
        )

    if not validate_image(file_bytes):
        raise HTTPException(
            status_code=400,
            detail="Invalid image format",
        )

    image = PostRepository.upload_image(
        post_id=post_id,
        file_bytes=file_bytes,
        author_id=author_id,
        db=db,
    )

    if image is None:
        raise HTTPException(
            status_code=404,
            detail="Post not found",
        )

    return {
        "id": image.id,
        "post_id": image.post_id,
        "file_path": image.file_path,
        "created_at": image.created_at,
    }