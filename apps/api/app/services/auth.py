from typing import Optional
from fastapi import HTTPException, status
from prisma.models import User
from app.db import prisma
from app.core.security import get_password_hash, verify_password
from app.schemas.user import UserCreate

class AuthService:
    @staticmethod
    async def authenticate_user(email: str, password: str) -> Optional[User]:
        user = await prisma.user.find_unique(where={"email": email})
        if not user:
            return None
        if not verify_password(password, user.password):
            return None
        return user

    @staticmethod
    async def register_user(user_in: UserCreate) -> User:
        # Check if user already exists
        existing_user = await prisma.user.find_unique(where={"email": user_in.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists",
            )
        
        hashed_password = get_password_hash(user_in.password)
        
        # Create User and UserChatbot in a single transaction if possible
        # Prisma Python supports transaction context manager
        # However, for simplicity and since we want to return the user, we can nest them
        # or just create them sequentially. A proper transaction is safer.
        
        async with prisma.tx() as tx:
            user = await tx.user.create(
                data={
                    "email": user_in.email,
                    "password": hashed_password,
                    "fullName": user_in.fullName,
                }
            )
            
            # Auto-create UserChatbot
            await tx.userchatbot.create(
                data={
                    "userId": user.id
                }
            )
            
        return user
