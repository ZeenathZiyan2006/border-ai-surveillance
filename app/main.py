from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import Camera, Alert

from app.routers import camera, alerts, video


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Border Surveillance Backend",
    version="1.0.0",
    description="Backend API for AI-powered border surveillance, camera management, video analysis and alerts."
)


# Allow frontend applications to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers
app.include_router(camera.router)
app.include_router(alerts.router)
app.include_router(video.router)


@app.get("/")
def home():
    return {
        "message": "AI Border Surveillance Backend is running",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
