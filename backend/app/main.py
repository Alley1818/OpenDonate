from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
<<<<<<< Updated upstream
from backend.app.router import router as post_router
from backend.app.auth.user_router import user_router, creator_router
=======
from fastapi.concurrency import run_in_threadpool
from backend.app.db import engine
from backend.app.models import Base
from backend.app.auth.user_router import router as user_router

>>>>>>> Stashed changes




@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI()

app.include_router(post_router)
app.include_router(user_router)
app.include_router(creator_router)

<<<<<<< Updated upstream
app.frontend("/", directory="frontend/dist")
=======
>>>>>>> Stashed changes

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