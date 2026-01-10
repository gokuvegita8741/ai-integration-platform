from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db import prisma
from app.api.v1.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await prisma.connect()
    print("Successfully connected to the database.")
    yield
    await prisma.disconnect()

app = FastAPI(title="AI Integration Platform API", lifespan=lifespan)

# Routes
app.include_router(api_router, prefix="/api/v1")

# Health Check
@app.get("/health")
def health_check():
    return {"status": "Welcome"}
