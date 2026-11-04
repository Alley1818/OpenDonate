from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
<<<<<<< Updated upstream
from fastapi.concurrency import run_in_threadpool
from backend.app.db import engine
from backend.app.models import Base
from backend.app.auth.user_router import router as user_router

=======
from starlette.staticfiles import StaticFiles

from backend.app.router import router as post_router
from backend.app.auth.user_router import user_router, creator_router
>>>>>>> Stashed changes




@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

from backend.app.router import router as post_router
from backend.app.auth.user_router import user_router


app = FastAPI()

app.include_router(post_router)
app.include_router(user_router)

<<<<<<< Updated upstream

=======
app.mount(
    "/",
    StaticFiles(directory="frontend/dist", html=True),
    name="frontend"
)
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