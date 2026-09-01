from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Camera
from app.schemas import CameraCreate, CameraResponse


router = APIRouter(
    prefix="/cameras",
    tags=["Cameras"]
)


@router.get("/", response_model=list[CameraResponse])
def get_cameras(db: Session = Depends(get_db)):
    return db.query(Camera).all()


@router.post("/", response_model=CameraResponse)
def add_camera(
    camera: CameraCreate,
    db: Session = Depends(get_db)
):
    new_camera = Camera(
        name=camera.name,
        location=camera.location,
        status=camera.status
    )

    db.add(new_camera)
    db.commit()
    db.refresh(new_camera)

    return new_camera


@router.get("/{camera_id}", response_model=CameraResponse)
def get_camera(
    camera_id: int,
    db: Session = Depends(get_db)
):
    camera = db.query(Camera).filter(
        Camera.id == camera_id
    ).first()

    if camera is None:
        raise HTTPException(
            status_code=404,
            detail="Camera not found"
        )

    return camera


@router.put("/{camera_id}/status")
def update_camera_status(
    camera_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    camera = db.query(Camera).filter(
        Camera.id == camera_id
    ).first()

    if camera is None:
        raise HTTPException(
            status_code=404,
            detail="Camera not found"
        )

    camera.status = status

    db.commit()
    db.refresh(camera)

    return {
        "message": "Camera status updated successfully",
        "camera": camera
    }
