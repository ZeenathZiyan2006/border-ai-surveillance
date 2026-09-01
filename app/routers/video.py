from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import os
import shutil

from app.database import get_db
from app.models import Alert
from app.services.detection import detect_video


router = APIRouter(
    prefix="/video",
    tags=["Video"]
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/avi",
    "video/x-msvideo",
    "video/quicktime"
}


@router.post("/upload")
def upload_video(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only MP4, AVI and MOV video files are allowed"
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No filename provided"
        )

    file_path = os.path.join(UPLOAD_DIR, os.path.basename(file.filename))

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    detection_result = detect_video(file_path)

    if not detection_result.get("detected"):
        return {
            "message": "Video uploaded and analyzed successfully",
            "filename": file.filename,
            "path": file_path,
            "detection": detection_result,
            "people_detected": 0,
            "alert_created": False
        }

    person_detections = [
        detection
        for detection in detection_result["detections"]
        if detection["object"] == "person"
    ]

    people_detected = len(person_detections)
    alert_created = False

    if people_detected > 0:

        highest_confidence = max(
            detection["confidence"]
            for detection in person_detections
        )

        new_alert = Alert(
            camera_id=1,
            alert_type="person_detected",
            message="Person detected in border surveillance video",
            severity="high",
            confidence=highest_confidence
        )

        db.add(new_alert)
        db.commit()

        alert_created = True

    return {
        "message": "Video uploaded and analyzed successfully",
        "filename": file.filename,
        "path": file_path,
        "detection": detection_result,
        "people_detected": people_detected,
        "alert_created": alert_created
    }
