from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from app.db.database import SessionLocal, engine
from app.db.models import User, Base
from app.auth.schemas import RegisterRequest, LoginRequest, TokenResponse
from app.auth.service import hash_password, verify_password, create_access_token

# Initialize database tables (only create if they don't exist)
try:
    Base.metadata.create_all(bind=engine, checkfirst=True)
except Exception as e:
    print(f"Database initialization warning: {e}")

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    try:
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            name=data.name,
            email=data.email,
            hashed_password=hash_password(data.password)
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Generate token
        token = create_access_token(user.id)
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer"}
