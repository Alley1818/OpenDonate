from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db import create_tables, delete_tables
from app.schemas import PostCreate
from app.router import router as post_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield
    await delete_tables()

app = FastAPI(lifespan=lifespan)
app.include_router(post_router)