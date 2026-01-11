from typing import Annotated
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import create_access_token
from app.core.config import settings
from app.schemas.token import LoginResponse
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.services.auth import AuthService
from app.api import deps
from prisma.models import User

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate):
    return await AuthService.register_user(user_in)

@router.post("/login", response_model=LoginResponse)
async def login(login_data: UserLogin):
    user = await AuthService.authenticate_user(login_data.email, login_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    return LoginResponse(access_token=access_token, token_type="bearer", email=user.email, fullName=user.fullName, userId=user.id)

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: Annotated[User, Depends(deps.get_current_user)]):
    return current_user
