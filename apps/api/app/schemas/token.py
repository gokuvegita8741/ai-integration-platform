from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    userId: str
    email: str
    fullName: str | None = None
    expiresAt: int
