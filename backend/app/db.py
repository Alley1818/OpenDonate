from collections.abc import Iterator
from contextlib import asynccontextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from backend.app.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(engine, expire_on_commit=False)


@asynccontextmanager
async def get_db() -> Iterator[Session]:
    with SessionLocal() as session:
        yield session
