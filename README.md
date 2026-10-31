# OpenDonate

**An open-source platform for creators to share content and receive support from their audience.**

OpenDonate is a creator-support platform inspired by [Boosty](https://boosty.to/) and [Patreon](https://www.patreon.com/). It aims to provide creators with a space to publish content, build a community, and offer exclusive content to their supporters.

The project is being developed as an open-source alternative with a focus on simplicity, extensibility, and a clean user experience.

> **Project status:** Under active development. Features and APIs may change.

## Overview

OpenDonate is designed around a simple idea: creators should have control over their content and the way they interact with their audience.

The platform is planned to support:

- Creator profiles.
- Public and exclusive publications.
- A social feed.
- Paid subscriptions and creator support.
- Community interaction.

## Features

### Implemented

- User registration.
- User authentication.
- Password hashing.
- JWT-based authentication using cookies.
- User and publication database models.
- Creating and retrieving publications.
- Public and paid publication visibility.
- Database migrations with Alembic.

### Planned

- Creator profiles.
- Subscription tiers.
- Payment integration.
- Exclusive content access.
- Likes and comments.
- Publication images and media uploads.
- Search and discovery.
- User settings.

## Tech Stack

### Backend

- Python 3.11+
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- Pydantic
- AuthX
- pwdlib

### Frontend

- React 18
- Vite
- JavaScript
- lucide-react

## Project Structure

```text
OpenDonate/
├── backend/
│   └── app/
│       ├── auth/
│       ├── main.py
│       ├── models.py
│       ├── schemas.py
│       ├── router.py
│       ├── repository.py
│       ├── db.py
│       └── config.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── migrations/
├── alembic.ini
├── pyproject.toml
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have installed:

- Python 3.11 or newer.
- PostgreSQL.
- Node.js and npm.
- Git.

### 1. Clone the repository

```bash
git clone https://github.com/Alley1818/OpenDonate.git
cd OpenDonate
```

### 2. Set up the backend

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

Install the project dependencies:

```bash
pip install -e .
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/opendonate
SECRET_KEY=your-secret-key
```

Replace the database credentials with your own values.

Do not commit `.env` or expose your secret key.

### 4. Run database migrations

```bash
alembic upgrade head
```

### 5. Start the backend

```bash
uvicorn backend.app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

### 6. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

## Contributing

OpenDonate is an open-source project, and contributions are welcome.

If you want to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Submit a pull request.

For major changes, consider opening an issue first to discuss the proposed implementation.

## License

The project is currently under development. License information will be added once the licensing terms are finalized.

---

**OpenDonate — a platform built to give creators more control over their content and audience.**