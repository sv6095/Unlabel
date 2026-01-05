from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config.settings import DATABASE_URL
import os

# For SQLite, adjust connection args based on environment
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    # In serverless environments (Vercel), use /tmp for SQLite
    # Vercel provides /tmp as writable directory
    if os.getenv("VERCEL") or os.getenv("ENV") == "production":
        # Use /tmp directory for SQLite in serverless (Vercel)
        db_path = DATABASE_URL.replace("sqlite:///", "").replace("sqlite://", "")
        if db_path and not db_path.startswith("/tmp"):
            # Use /tmp as fallback for serverless
            db_name = os.path.basename(db_path) if db_path and "/" in db_path else (db_path or "food_intelligence.db")
            DATABASE_URL = f"sqlite:////tmp/{db_name}"

try:
    engine = create_engine(
        DATABASE_URL, connect_args=connect_args, pool_pre_ping=True
    )
except Exception as e:
    print(f"Database engine creation error: {e}")
    # Fallback to in-memory database if file-based fails
    if DATABASE_URL.startswith("sqlite"):
        DATABASE_URL = "sqlite:///:memory:"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()
