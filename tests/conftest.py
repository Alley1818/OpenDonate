
import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from backend.app.auth.security import hash_password
from backend.app.config import settings
from backend.app.db import get_db
from backend.app.main import app
from backend.app.models import Base, User


@pytest.fixture(scope="session")
def test_engine():
    database_url = settings.TEST_DATABASE_URL

    if not database_url:
        pytest.fail("TEST_DATABASE_URL is not configured")

    engine = create_engine(
        database_url,
        pool_pre_ping=True,
    )

    database_name = engine.url.database

    if not database_name or not database_name.endswith("_test"):
        engine.dispose()
        pytest.fail("Refusing to run tests against a non-test database")

    Base.metadata.create_all(bind=engine)

    yield engine

    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture
def db_connection(test_engine):
    connection = test_engine.connect()
    transaction = connection.begin()

    yield connection

    transaction.rollback()
    connection.close()


@pytest.fixture
def db_session(db_connection):
    with Session(
        bind=db_connection,
        join_transaction_mode="create_savepoint",
    ) as session:
        yield session


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session

    original_overrides = app.dependency_overrides.copy()
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    app.dependency_overrides.update(original_overrides)


@pytest.fixture
def test_user(db_session):
    user = User(
        email="test_mail@mail.ru",
        username="test_username",
        password_hash=hash_password("test_password"),
    )

    db_session.add(user)
    db_session.flush()
    db_session.refresh(user)

    return user