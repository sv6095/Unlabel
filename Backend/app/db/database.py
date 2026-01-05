from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config.settings import DATABASE_URL
import os

# PostgreSQL configuration for production
# Vercel Postgres connection string format:
# postgresql://user:password@host:port/database?sslmode=require
engine_kwargs = {
    "pool_pre_ping": True,
    "pool_size": 5,
    "max_overflow": 10,
}

# For serverless (Vercel), use smaller connection pool
if os.getenv("VERCEL"):
    engine_kwargs["pool_size"] = 1
    engine_kwargs["max_overflow"] = 0

# Validate that DATABASE_URL is PostgreSQL
if not DATABASE_URL or not (DATABASE_URL.startswith("postgresql") or DATABASE_URL.startswith("postgres")):
    raise ValueError(
        "DATABASE_URL must be a PostgreSQL connection string. "
        "Please set DATABASE_URL or POSTGRES_URL environment variable. "
        "Example: postgresql://user:password@host:port/database?sslmode=require"
    )

engine = create_engine(DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()
