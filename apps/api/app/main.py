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

@app.get("/")
def root():
    return {"message": "Welcome to AI Integration Platform API"}

@app.get("/health")
def health_check():
    return {"status": "Welcome"}
