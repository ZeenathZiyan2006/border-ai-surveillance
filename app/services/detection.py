from ultralytics import YOLO
import cv2


# Load YOLO model
model = YOLO("yolo11n.pt")


def detect_objects(image_path: str):
    """
    Detect objects in a single image.
    """

    results = model(
        image_path,
        verbose=False
    )

    detections = []

    for result in results:

        for box in result.boxes:

            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            object_name = model.names[class_id]

            detections.append({
                "object": object_name,
                "confidence": round(confidence, 2)
            })

    return {
        "detected": len(detections) > 0,
        "detections": detections
    }


def detect_video(video_path: str):
    """
    Analyze a video frame by frame using YOLO.
    """

    video = cv2.VideoCapture(video_path)

    if not video.isOpened():
        return {
            "detected": False,
            "total_detections": 0,
            "detections": [],
            "message": "Could not open video"
        }

    detections = []
    frame_number = 0

    while True:

        success, frame = video.read()

        if not success:
            break

        frame_number += 1

        # Run YOLO on current frame
        results = model(
            frame,
            verbose=False
        )

        for result in results:

            for box in result.boxes:

                class_id = int(box.cls[0])
                confidence = float(box.conf[0])

                object_name = model.names[class_id]

                detections.append({
                    "frame": frame_number,
                    "object": object_name,
                    "confidence": round(confidence, 2)
                })

    video.release()

    return {
        "detected": len(detections) > 0,
        "total_detections": len(detections),
        "detections": detections
    }