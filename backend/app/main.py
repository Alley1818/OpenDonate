from contextlib import asynccontextmanager
from fastapi import FastAPI
from backend.app.router import router as post_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from backend.app.db import engine
from backend.app.models import Base
from backend.app.user_router import router as user_router





@asynccontextmanager
async def lifespan(_: FastAPI):
    await run_in_threadpool(Base.metadata.create_all, bind=engine)
    yield




app = FastAPI(lifespan=lifespan)
app.include_router(post_router)
app.include_router(user_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)