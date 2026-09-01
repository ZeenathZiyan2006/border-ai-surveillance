import os


def detect_objects(video_path: str):
    """
    Basic video detection service.

    Checks whether the uploaded video exists and can be processed.
    Actual AI object detection will be added next.
    """

    if not os.path.exists(video_path):
        return {
            "detected": False,
            "object": None,
            "confidence": 0.0,
            "message": "Video file not found"
        }

    return {
        "detected": True,
        "object": "video",
        "confidence": 1.0,
        "message": "Video received successfully"
    }