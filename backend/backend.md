# MindFlow Backend

This is the core backend service for MindFlow, a mental wellness application developed using a multi-agent AI strategy.

## 🚀 Features

- **Authentication**: Secure JWT-based auth with granular privacy controls.
- **Mood Tracking**: Log mood, energy, anxiety, and factors.
- **Journaling**: AES-256 encrypted journal entries for complete privacy.
- **AI Chat**: Therapeutic chat interface powered by **Google Gemini 2.5**.
- **Crisis Detection**: Real-time safety monitoring and resource surfacing.
- **Insights**: Pattern detection (weekly trends, factor correlations) using Prophet.
- **Content Library**: Curated library of meditations and exercises.

## 🛠️ Tech Stack

- **Language**: Python 3.12+
- **Framework**: FastAPI
- **Database**: PostgreSQL 16 + pgvector (for embeddings)
- **Cache**: Redis
- **ML**: Transformers (Sentiment), Prophet (Forecasting), Google GenAI SDK

## 🏗️ Setup & Installation

### Prerequisites
- Docker & Docker Compose
- Python 3.12+ (optional, for local dev without Docker)

### 1. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```
Edit `.env` to add your keys:
- `JWT_SECRET`: Generate a secure random string
- `ENCRYPTION_KEY`: Generate a 32-byte key
- `GEMINI_API_KEY`: Your Google Gemini API key

### 2. Run with Docker (Recommended)

Start the entire stack:
```bash
docker-compose up -d --build
```

### 3. Database Management

Apply database migrations:
```bash
docker-compose run --rm api alembic upgrade head
```

Seed initial data (crisis resources, content library):
```bash
docker-compose run --rm api python scripts/seed_crisis.py
docker-compose run --rm api python scripts/seed_content.py
```

## 🧪 Testing

Run the test suite:
```bash
docker-compose run --rm api pytest -v
```

## 📚 API Documentation

Once running, access the interactive API docs:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📂 Project Structure

- `app/api/v1`: Route definitions grouped by functional area
- `app/models`: SQLAlchemy database models
- `app/services`: Business logic and service layer
- `app/ml`: Machine learning components (Gemini wrapper, detectors)
- `alembic/`: Database migration scripts
