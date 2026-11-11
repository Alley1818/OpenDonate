from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")
    DATABASE_URL: str
    TEST_DATABASE_URL: str | None = None
    SECRET_KEY: str
    ALGORITHM : str
    ACCESS_TOKEN_EXPIRE_MINUTES : int
settings = Settings()