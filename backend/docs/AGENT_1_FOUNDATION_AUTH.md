# Agent 1: Foundation & Authentication

## Your Role
You are responsible for setting up the **core project infrastructure** and **authentication system** for MindFlow, a mental wellness backend API. You work in parallel with 3 other agents who depend on your foundation.

---

## Priority: HIGH (Other agents depend on you)
Complete your work **first** so other agents can build on top.

---

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | FastAPI | 0.115+ |
| Python | Python | 3.12+ |
| Database | PostgreSQL + pgvector | 16+ |
| ORM | SQLAlchemy | 2.0+ |
| Migrations | Alembic | 1.14+ |
| Validation | Pydantic | 2.10+ |
| Auth | PyJWT | 2.10+ |
| Password | Passlib[bcrypt] | 1.7+ |
| Async DB | asyncpg | 0.30+ |
| Settings | pydantic-settings | 2.7+ |
| Testing | pytest + pytest-asyncio | 8.0+ |

---

## Files You Own (CREATE THESE)

```
d:\newApp\
├── app/
│   ├── __init__.py
│   ├── main.py                      # FastAPI app + middleware
│   ├── config.py                    # Settings with pydantic-settings
│   ├── database.py                  # Async SQLAlchemy engine & session
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py                  # get_db, get_current_user dependencies
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py            # Main router aggregator
│   │       └── auth.py              # Auth endpoints
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py                  # Base model with common fields
│   │   └── user.py                  # User, UserConsent, OAuthConnection
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── common.py                # Shared schemas (pagination, etc.)
│   │   ├── auth.py                  # Auth request/response schemas
│   │   └── user.py                  # User schemas
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── base.py                  # BaseService class
│   │   ├── auth_service.py          # Auth business logic
│   │   └── user_service.py          # User CRUD operations
│   │
│   └── utils/
│       ├── __init__.py
│       ├── security.py              # JWT, password hashing
│       └── exceptions.py            # Custom HTTP exceptions
│
├── alembic/
│   ├── env.py
│   └── versions/
│       └── 001_initial_schema.py
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py                  # Shared fixtures
│   └── test_auth.py
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── .env.example
├── requirements.txt
├── pyproject.toml
├── alembic.ini
└── README.md
```

---

## Detailed Implementation

### 1. `requirements.txt`

```txt
# Core
fastapi==0.115.6
uvicorn[standard]==0.34.0
python-multipart==0.0.20

# Database
sqlalchemy[asyncio]==2.0.37
asyncpg==0.30.0
alembic==1.14.1
pgvector==0.3.6

# Validation & Settings
pydantic==2.10.5
pydantic-settings==2.7.1
email-validator==2.2.0

# Auth
pyjwt==2.10.1
passlib[bcrypt]==1.7.4

# Utilities
python-dateutil==2.9.0
httpx==0.28.1

# Testing
pytest==8.3.4
pytest-asyncio==0.25.2
pytest-cov==6.0.0

# Dev
black==24.10.0
ruff==0.9.3
```

### 2. `app/config.py`

```python
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    app_name: str = "MindFlow API"
    debug: bool = False
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"

    # Database
    database_url: str = "postgresql+asyncpg://mindflow:password@localhost:5432/mindflow"
    db_pool_size: int = 5
    db_max_overflow: int = 10
    db_echo: bool = False

    # Redis (for future rate limiting)
    redis_url: str = "redis://localhost:6379"

    # JWT Auth
    jwt_secret: str = "CHANGE_ME_IN_PRODUCTION"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30

    # Gemini AI (used by Agent 3)
    gemini_api_key: str = ""

    # Encryption key for sensitive data
    encryption_key: str = "CHANGE_ME_32_BYTE_KEY_HERE_1234"

    # CORS
    allowed_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
```

### 3. `app/database.py`

```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings


class Base(DeclarativeBase):
    pass


engine = create_async_engine(
    settings.database_url,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    echo=settings.db_echo,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

### 4. `app/models/base.py`

```python
from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class BaseModel(Base, TimestampMixin):
    __abstract__ = True

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )
```

### 5. `app/models/user.py`

```python
from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    display_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")
    locale: Mapped[str] = mapped_column(String(10), default="en-US")

    # Subscription
    subscription_tier: Mapped[str] = mapped_column(String(20), default="free")
    subscription_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Privacy
    anonymous_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, default=lambda: uuid4().hex)
    data_retention_days: Mapped[int] = mapped_column(Integer, default=365)

    # Status
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    consents: Mapped[list["UserConsent"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    oauth_connections: Mapped[list["OAuthConnection"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    @property
    def is_premium(self) -> bool:
        if self.subscription_tier == "free":
            return False
        if self.subscription_expires_at and self.subscription_expires_at < datetime.utcnow():
            return False
        return True


class UserConsent(BaseModel):
    __tablename__ = "user_consents"
    __table_args__ = (UniqueConstraint("user_id", "consent_type", name="uq_user_consent"),)

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    consent_type: Mapped[str] = mapped_column(String(50), nullable=False)
    granted: Mapped[bool] = mapped_column(Boolean, default=False)
    granted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)

    user: Mapped["User"] = relationship(back_populates="consents")


class OAuthConnection(BaseModel):
    __tablename__ = "oauth_connections"
    __table_args__ = (UniqueConstraint("provider", "provider_user_id", name="uq_provider_user"),)

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider: Mapped[str] = mapped_column(String(20), nullable=False)
    provider_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    access_token_encrypted: Mapped[bytes | None] = mapped_column(nullable=True)
    refresh_token_encrypted: Mapped[bytes | None] = mapped_column(nullable=True)
    token_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="oauth_connections")
```

### 6. `app/utils/security.py`

```python
from datetime import datetime, timedelta, timezone
from uuid import UUID
import jwt
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: UUID, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "access",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(user_id: UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "refresh",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except jwt.PyJWTError:
        return None
```

### 7. `app/utils/exceptions.py`

```python
from fastapi import HTTPException, status


class BadRequestException(HTTPException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class UnauthorizedException(HTTPException):
    def __init__(self, detail: str = "Invalid credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ForbiddenException(HTTPException):
    def __init__(self, detail: str = "Access forbidden"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class NotFoundException(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class ConflictException(HTTPException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)
```

### 8. `app/schemas/auth.py`

```python
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str | None = Field(None, min_length=2, max_length=100)
    timezone: str = "UTC"
    locale: str = "en-US"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    email_verified: bool
    display_name: str | None
    avatar_url: str | None
    timezone: str
    locale: str
    subscription_tier: str
    is_premium: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
```

### 9. `app/api/deps.py`

```python
from typing import Annotated
from uuid import UUID
from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.utils.security import decode_token
from app.utils.exceptions import UnauthorizedException


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedException("Missing or invalid authorization header")

    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)

    if not payload or payload.get("type") != "access":
        raise UnauthorizedException("Invalid or expired token")

    user_id = UUID(payload["sub"])
    result = await db.execute(select(User).where(User.id == user_id, User.deleted_at.is_(None)))
    user = result.scalar_one_or_none()

    if not user:
        raise UnauthorizedException("User not found")

    return user


async def get_current_user_optional(
    authorization: Annotated[str | None, Header()] = None,
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if not authorization:
        return None
    try:
        return await get_current_user(authorization, db)
    except UnauthorizedException:
        return None


# Type aliases for cleaner endpoint signatures
CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalUser = Annotated[User | None, Depends(get_current_user_optional)]
DBSession = Annotated[AsyncSession, Depends(get_db)]
```

### 10. `app/services/auth_service.py`

```python
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.utils.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.utils.exceptions import ConflictException, UnauthorizedException
from app.config import settings


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: RegisterRequest) -> User:
        # Check if email exists
        existing = await self.db.execute(select(User).where(User.email == data.email))
        if existing.scalar_one_or_none():
            raise ConflictException("Email already registered")

        user = User(
            email=data.email,
            password_hash=hash_password(data.password),
            display_name=data.display_name,
            timezone=data.timezone,
            locale=data.locale,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def login(self, data: LoginRequest) -> TokenResponse:
        result = await self.db.execute(
            select(User).where(User.email == data.email, User.deleted_at.is_(None))
        )
        user = result.scalar_one_or_none()

        if not user or not user.password_hash:
            raise UnauthorizedException("Invalid email or password")

        if not verify_password(data.password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")

        # Update last active
        user.last_active_at = datetime.now(timezone.utc)
        await self.db.commit()

        return TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
        )

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        from app.utils.security import decode_token

        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid refresh token")

        from uuid import UUID
        user_id = UUID(payload["sub"])

        result = await self.db.execute(
            select(User).where(User.id == user_id, User.deleted_at.is_(None))
        )
        user = result.scalar_one_or_none()

        if not user:
            raise UnauthorizedException("User not found")

        return TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
        )
```

### 11. `app/api/v1/auth.py`

```python
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.api.deps import CurrentUser

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    service = AuthService(db)
    user = await service.register(data)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate and receive tokens."""
    service = AuthService(db)
    return await service.login(data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Refresh access token using refresh token."""
    service = AuthService(db)
    return await service.refresh_tokens(data.refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: CurrentUser):
    """Get current authenticated user info."""
    return current_user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(current_user: CurrentUser):
    """Logout (client should discard tokens)."""
    # In a full implementation, you'd add the token to a blacklist
    return None
```

### 12. `app/api/v1/router.py`

```python
from fastapi import APIRouter
from app.api.v1 import auth

api_router = APIRouter()

# Include all routers here
api_router.include_router(auth.router)

# Other agents will add their routers:
# api_router.include_router(mood.router)       # Agent 2
# api_router.include_router(journal.router)    # Agent 2
# api_router.include_router(chat.router)       # Agent 3
# api_router.include_router(insights.router)   # Agent 4
# api_router.include_router(recommendations.router)  # Agent 4
# api_router.include_router(crisis.router)     # Agent 3
```

### 13. `app/main.py`

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"Starting {settings.app_name}...")
    yield
    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title=settings.app_name,
    description="Mental wellness companion API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.app_name}
```

### 14. `docker/docker-compose.yml`

```yaml
version: '3.8'

services:
  api:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://mindflow:password@db:5432/mindflow
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET:-dev-secret-change-me}
      - DEBUG=true
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ../app:/app/app  # Hot reload in dev
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: mindflow
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mindflow
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mindflow"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 15. `docker/Dockerfile`

```dockerfile
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini .

RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 16. `alembic.ini` (key parts)

```ini
[alembic]
script_location = alembic
sqlalchemy.url = postgresql+asyncpg://mindflow:password@localhost:5432/mindflow

[loggers]
keys = root,sqlalchemy,alembic
```

### 17. `.env.example`

```env
# Application
DEBUG=true
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql+asyncpg://mindflow:password@localhost:5432/mindflow

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-key-change-in-production

# Gemini AI (for Agent 3)
GEMINI_API_KEY=your-gemini-api-key

# Encryption
ENCRYPTION_KEY=32-byte-key-for-encrypting-data
```

---

## Testing Requirements

Create `tests/conftest.py`:

```python
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.main import app
from app.database import Base, get_db

TEST_DATABASE_URL = "postgresql+asyncpg://mindflow:password@localhost:5432/mindflow_test"


@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine(TEST_DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session
        await session.rollback()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client(db_session):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
```

---

## Checklist Before Moving On

- [ ] All files created and syntax verified
- [ ] `docker-compose up -d db` works
- [ ] Alembic migration created and applied
- [ ] `/health` endpoint returns 200
- [ ] `/api/v1/auth/register` creates user
- [ ] `/api/v1/auth/login` returns tokens
- [ ] `/api/v1/auth/me` returns user with valid token
- [ ] Tests pass

---

## Handoff Notes for Other Agents

**Agent 2, 3, 4**: After Agent 1 completes:
1. Import models from `app.models`
2. Use `DBSession` and `CurrentUser` from `app.api.deps`
3. Add your routers to `app/api/v1/router.py`
4. Create Alembic migrations for new tables
5. Follow the same patterns for services and schemas
