from fastapi import FastAPI

app = FastAPI(title="AI Integration Platform API")

@app.get("/")
def root():
    return {"message": "Welcome to AI Integration Platform API"}
@app.get("/health")
def health_check():
    return {"status": "Welcome"}
