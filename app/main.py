from fastapi import FastAPI

from app.routers import camera, alerts, video


app = FastAPI(
    title="AI Border Surveillance Backend",
    version="1.0.0"
)


app.include_router(camera.router)
app.include_router(alerts.router)
app.include_router(video.router)


@app.get("/")
def home():
    return {
        "message": "AI Border Surveillance Backend is working!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }