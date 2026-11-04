from pwdlib import PasswordHash
from authx import AuthX, AuthXConfig
from backend.app.config import settings

auth_config = AuthXConfig()
auth_config.JWT_SECRET_KEY = settings.SECRET_KEY
auth_config.JWT_ALGORITHM = "HS256"
auth_config.JWT_ACCESS_COOKIE_NAME = "access_token"
auth_config.JWT_REFRESH_COOKIE_NAME = "refresh_token"
auth_config.JWT_TOKEN_LOCATION = ["cookies"]
#auth_config.JWT_COOKIE_CSRF_PROTECT = True
# auth_config.JWT_COOKIE_SECURE = True
#auth_config.JWT_COOKIE_HTTPONLY = True

security = AuthX(config=auth_config)



password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(plain_password:str, hashed_password:str) -> bool:
    return password_hash.verify(plain_password, hashed_password)