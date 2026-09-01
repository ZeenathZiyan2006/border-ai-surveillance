from fastapi import APIRouter
from pydantic import BaseModel
from app.services.detection import detect_objects


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


class Alert(BaseModel):
    camera_id: int
    alert_type: str
    message: str
    severity: str = "medium"


alerts = []


@router.get("/")
def get_alerts():
    return {
        "alerts": alerts
    }


@router.post("/")
def create_alert(alert: Alert):
    new_alert = {
        "id": len(alerts) + 1,
        "camera_id": alert.camera_id,
        "alert_type": alert.alert_type,
        "message": alert.message,
        "severity": alert.severity
    }

    alerts.append(new_alert)

    return {
        "message": "Alert created successfully",
        "alert": new_alert
    }


@router.get("/detect")
def detect():
    return detect_objects()