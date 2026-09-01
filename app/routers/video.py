from fastapi import APIRouter, UploadFile, File
import os
import shutil

from app.services.detection import detect_objects


router = APIRouter(
    prefix="/video",
    tags=["Video"]
)

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
def upload_video(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    detection_result = detect_objects(file_path)

    return {
        "message": "Video uploaded successfully",
        "filename": file.filename,
        "path": file_path,
        "detection": detection_result
    }