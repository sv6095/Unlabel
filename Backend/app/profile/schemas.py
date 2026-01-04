from pydantic import BaseModel, EmailStr
from typing import Optional

class ProfileUser(BaseModel):
    id: str
    name: str
    email: EmailStr
    preferences: Optional[str] = None

class ProfileUpdate(BaseModel):
    preferences: Optional[str] = None
