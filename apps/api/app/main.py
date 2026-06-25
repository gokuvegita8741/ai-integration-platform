import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.db import prisma
from app.api.v1.api import api_router

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure uploads directory exists
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    print("Connecting to DB...")
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

# Mount uploads as static files
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Routes
app.include_router(api_router, prefix="/api/v1")

# Health Check
@app.get("/health")
def health_check():
    return {"status": "Welcome"}
