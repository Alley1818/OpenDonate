from io import BytesIO
from pathlib import Path
import uuid
from PIL import Image, UnidentifiedImageError


PROJECT_ROOT = Path(__file__).resolve().parents[3]
UPLOAD_DIR = PROJECT_ROOT / "uploads" / "posts"
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB

def validate_image(file_bytes: bytes) -> bool:
    try:
        with Image.open(BytesIO(file_bytes)) as image:
            if image.format not in ALLOWED_FORMATS:
                return False

            image.verify()

        return True

    except (UnidentifiedImageError, OSError):
        return False


def validate_image_size(file_bytes: bytes) -> bool:
    return len(file_bytes) <= MAX_IMAGE_SIZE


def generate_filename(image_format: str) -> str:
    extension = image_format.lower()
    return f"{uuid.uuid4()}.{extension}"


def save_image(file_bytes: bytes) -> str:
    if not validate_image(file_bytes):
        raise ValueError("Invalid image")

    with Image.open(BytesIO(file_bytes)) as image:
        image_format = image.format

    filename = generate_filename(image_format)

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    file_path = UPLOAD_DIR / filename
    file_path.write_bytes(file_bytes)

    return str(file_path.relative_to(PROJECT_ROOT))