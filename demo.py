"""
demo.py
-------
Simple demo script showing how to use the Video Streaming Module
and integrate a mock AI detection model (drawing a bounding box + text).
"""
import sys
import cv2
import numpy as np
# Ensure UTF-8 output encoding for Windows command line emoji support
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
from camera_manager import check_camera
from video_processor import process_video
def my_custom_ai_detector(frame: np.ndarray) -> np.ndarray:
    """
    Example AI model function:
    Draws a simulated detection box and label on each frame.
    """
    output_frame = frame.copy()
    height, width, _ = output_frame.shape
    # Draw a mock bounding box (green rectangle in center)
    start_point = (int(width * 0.25), int(height * 0.25))
    end_point = (int(width * 0.75), int(height * 0.75))
    cv2.rectangle(output_frame, start_point, end_point, (0, 255, 0), 2)
    # Add AI detection label text
    label = "AI Model: Person (98%)"
    cv2.putText(
        output_frame,
        label,
        (start_point[0], start_point[1] - 10),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (0, 255, 0),
        2
    )
    return output_frame
def run_demo() -> None:
    source = "test.mp4"  # Use 'test.mp4' or 0 for webcam
    camera_name = "Demo Stream"
    print("========================================")
    print("      CCTV MODULE SIMPLE DEMO           ")
    print("========================================\n")
    # Step 1: Health check
    is_online = check_camera(camera_name, source)
    if not is_online:
        print(f"Source '{source}' is offline/unavailable.")
        return
    # Step 2: Plug in custom AI function into video_processor
    import video_processor
    video_processor.send_frame_to_ai = my_custom_ai_detector
    print("\nStarting video stream with AI detection overlay...")
    print("Press 'Q' on the video window to quit.\n")
    # Step 3: Run streaming loop
    process_video(camera_name, source)
if __name__ == "__main__":
    run_demo()
