from pydantic import BaseModel


class CameraCreate(BaseModel):
    name: str
    location: str
    status: str = "offline"


class CameraResponse(BaseModel):
    id: int
    name: str
    location: str
    status: str

    class Config:
        from_attributes = True


class AlertCreate(BaseModel):
    camera_id: int
    alert_type: str
    message: str
    severity: str = "medium"
    confidence: float | None = None


class AlertResponse(BaseModel):
    id: int
    camera_id: int
    alert_type: str
    message: str
    severity: str
    confidence: float | None

    class Config:
        from_attributes = True
