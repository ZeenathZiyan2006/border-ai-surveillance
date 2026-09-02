from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import os
import shutil

from app.database import get_db
from app.models import Alert
from app.schemas import AlertCreate, AlertResponse
from app.services.detection import detect_objects


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp"
}


@router.get("/", response_model=list[AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).all()


@router.post("/", response_model=AlertResponse)
def create_alert(
    alert: AlertCreate,
    db: Session = Depends(get_db)
):
    new_alert = Alert(
        camera_id=alert.camera_id,
        alert_type=alert.alert_type,
        message=alert.message,
        severity=alert.severity,
        confidence=alert.confidence
    )

    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    return new_alert


@router.post("/detect")
def detect(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG and WEBP images are allowed"
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No filename provided"
        )

    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(
        upload_dir,
        os.path.basename(file.filename)
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    detection_result = detect_objects(file_path)

    alerts_created = 0

    for detection in detection_result["detections"]:

        if detection["object"] == "person":

            new_alert = Alert(
                camera_id=1,
                alert_type="person_detected",
                message="Person detected in border surveillance area",
                severity="high",
                confidence=detection["confidence"]
            )

            db.add(new_alert)
            alerts_created += 1

    db.commit()

    return {
        "detection": detection_result,
        "alerts_created": alerts_created
    }
