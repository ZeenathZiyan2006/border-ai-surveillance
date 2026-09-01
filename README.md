# AI Border Surveillance Backend

Backend API for an AI-powered border surveillance system using FastAPI, YOLO11, OpenCV and SQLite.

## Features

- Camera management
- Camera status updates
- Image object detection using YOLO11
- Video frame-by-frame detection
- Person detection
- Automatic person alerts
- SQLite database
- Swagger API documentation
- CORS enabled for frontend integration

## Project Structure

backend/
+-- app/
¦   +-- database.py
¦   +-- models.py
¦   +-- schemas.py
¦   +-- main.py
¦   +-- routers/
¦   ¦   +-- camera.py
¦   ¦   +-- alerts.py
¦   ¦   +-- video.py
¦   +-- services/
¦       +-- detection.py
+-- requirements.txt
+-- yolo11n.pt
+-- main.py

## Installation

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8001






## Frontend connection

The frontend can send requests to:

http://127.0.0.1:8001

CORS is enabled for frontend development.

## Important

The YOLO model file `yolo11n.pt` is included in the project.

Uploaded files are stored locally in the `uploads` directory.

The SQLite database is created automatically when the backend starts.

## Technology

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Ultralytics YOLO11
- OpenCV
- Pydantic
