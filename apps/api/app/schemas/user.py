from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    fullName: str

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    fullName: str
    createdAt: datetime

    class Config:
        from_attributes = True
