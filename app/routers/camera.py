from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(
    prefix="/cameras",
    tags=["Cameras"]
)


class Camera(BaseModel):
    name: str
    location: str
    status: str = "online"


cameras = [
    {
        "id": 1,
        "name": "BOP Camera 1",
        "location": "Border Post A",
        "status": "online"
    }
]


@router.get("/")
def get_cameras():
    return {
        "cameras": cameras
    }


@router.post("/")
def add_camera(camera: Camera):
    new_camera = {
        "id": len(cameras) + 1,
        "name": camera.name,
        "location": camera.location,
        "status": camera.status
    }

    cameras.append(new_camera)

    return {
        "message": "Camera added successfully",
        "camera": new_camera
    }


@router.get("/{camera_id}")
def get_camera(camera_id: int):
    for camera in cameras:
        if camera["id"] == camera_id:
            return camera

    return {
        "message": "Camera not found"
    }




@router.put("/{camera_id}/status")
def update_camera_status(camera_id: int, status: str):
    for camera in cameras:
        if camera["id"] == camera_id:
            camera["status"] = status

            return {
                "message": "Camera status updated successfully",
                "camera": camera
            }

    return {
        "message": "Camera not found"
    }