# OpenDonate

Open-source платформа, где авторы публикуют контент и получают поддержку от своей аудитории.

[Changelog](CHANGELOG.md) · [Issues](https://github.com/Alley1818/OpenDonate/issues)

> **Статус:** ранняя разработка. Функции и API могут меняться.

## Зачем это нужно

Boosty и Patreon закрыты и доступны не всем авторам. OpenDonate задуман как простая, расширяемая альтернатива, которую можно развернуть у себя: автор сам контролирует свой контент и общение с аудиторией.

## Возможности

**Реализовано**
- Регистрация и аутентификация пользователей
- Хеширование паролей (argon2)
- JWT-авторизация через cookie
- Создание и получение публикаций

**В планах**
- Публичная и платная видимость публикаций
- Профили авторов
- Уровни подписки
- Интеграция платежей
- Доступ к эксклюзивному контенту
- Лайки и комментарии
- Загрузка медиа
- Поиск и рекомендации
- Настройки пользователя

Подробности и прогресс смотри в [issues](https://github.com/Alley1818/OpenDonate/issues).

## Технологии

**Backend:** Python 3.11+, FastAPI, SQLAlchemy, PostgreSQL, Alembic, Pydantic, AuthX, pwdlib
**Frontend:** React 18, Vite, JavaScript, lucide-react

## Структура проекта

```
OpenDonate/
├── <актуальная структура>
```

## Быстрый старт

### Требования
- Python 3.11+
- PostgreSQL
- Node.js и npm
- Git

### 1. Клонируй репозиторий
```bash
git clone https://github.com/Alley1818/OpenDonate.git
cd OpenDonate
```

### 2. Установи зависимости бэкенда
```bash
uv sync
```
или через pip:
```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

### 3. Настрой переменные окружения
Скопируй пример и заполни своими значениями:
```bash
cp .env.example .env
```
```
DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/opendonate
SECRET_KEY=your-secret-key
```
Никогда не коммить `.env` и не публикуй секретный ключ.

### 4. Примени миграции
```bash
alembic upgrade head
```

### 5. Запусти бэкенд
```bash
uvicorn <модуль>:app --reload
```
API: http://127.0.0.1:8000 · Документация: http://127.0.0.1:8000/docs

### 6. Запусти фронтенд
```bash
cd frontend
npm install
npm run dev
```
Фронтенд: http://localhost:5173

## Участие в разработке

Будем рады помощи. Если планируешь крупные изменения, сначала создай issue и обсуди их.

1. Сделай fork репозитория
2. Создай ветку под свою задачу
3. Внеси изменения и закоммить
4. Открой pull request

## Лицензия

Проект распространяется под лицензией [GNU AGPL-3.0](LICENSE).