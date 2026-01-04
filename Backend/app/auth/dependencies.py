from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from config.settings import SECRET_KEY, ALGORITHM
from app.db.database import SessionLocal
from app.db.models import User

# restoring OAuth2 scheme for Swagger UI "Authorize" button support
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login",
    auto_error=False
)

def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    authorization: str | None = Header(default=None)
):
    # Priority 1: Token from OAuth2 scheme (Standard "Bearer <token>")
    final_token = token
    
    # Debug print
    print(f"DEBUG: Auth Check. Token(OAuth2): {bool(token)}, Header: {authorization}")

    # Priority 2: Fallback to manual header parsing if OAuth2 scheme didn't find it
    if not final_token and authorization:
        if authorization.lower().startswith("bearer "):
            final_token = authorization.split(" ", 1)[1]
        else:
            final_token = authorization
            
    print(f"DEBUG: Final Token: {final_token[:10]}..." if final_token else "DEBUG: No token found")

    if not final_token:
        print("DEBUG: 401 - Authentication required (No token)")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    try:
        payload = jwt.decode(final_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        print(f"DEBUG: Token Decoded. User ID: {user_id}")
    except JWTError as e:
        print(f"DEBUG: 401 - JWT Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    if not user_id:
        print("DEBUG: 401 - No 'sub' in payload")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    db: Session = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    db.close()

    if not user:
        print(f"DEBUG: 401 - User ID {user_id} not found in DB")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
        
    print(f"DEBUG: Auth Success for user {user.email}")
    return user
