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

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Integration Platform API", lifespan=lifespan)

# CORS Configuration
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(api_router, prefix="/api/v1")

# Health Check
@app.get("/health")
def health_check():
    return {"status": "Welcome"}
