from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.profile.schemas import ProfileUser, ProfileUpdate
from app.auth.dependencies import get_current_user
from app.db.database import SessionLocal
from app.db.models import User

router = APIRouter(prefix="/profile", tags=["Profile"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=ProfileUser)
def get_profile(user: User = Depends(get_current_user)):
    return ProfileUser(
        id=user.id,
        name=user.name,
        email=user.email,
        preferences=user.preferences
    )

@router.patch("", response_model=ProfileUser)
def update_profile(
    update: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if update.preferences is not None:
        user.preferences = update.preferences
        db.commit()
        db.refresh(user)

    return ProfileUser(
        id=user.id,
        name=user.name,
        email=user.email,
        preferences=user.preferences
    )
