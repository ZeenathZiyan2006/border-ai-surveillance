from ultralytics import YOLO
import cv2
import os

print("Starting AI tracker...")

# Load YOLO model
model = YOLO("yolo11n.pt")

print("YOLO model loaded.")

# Open input video
input_path = "videos/test.mp4"
cap = cv2.VideoCapture(input_path)

if not cap.isOpened():
    print("ERROR: Could not open video.")
    exit()

print("Video opened successfully.")

# Get video properties
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)

# Create output folder if it doesn't exist
os.makedirs("output", exist_ok=True)

# Create output video
output_path = "output/tracked_video.mp4"

fourcc = cv2.VideoWriter_fourcc(*"mp4v")

out = cv2.VideoWriter(
    output_path,
    fourcc,
    fps,
    (width, height)
)

while True:

    # Read one frame
    ret, frame = cap.read()

    # Stop when video ends
    if not ret:
        break

    # Detect and track objects
    results = model.track(
        frame,
        persist=True,
        tracker="bytetrack.yaml"
    )

    # Draw boxes and IDs
    annotated_frame = results[0].plot()

    # Show video
    cv2.imshow("AI Tracking", annotated_frame)

    # Save frame
    out.write(annotated_frame)

    # Press Q to quit
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Release everything
cap.release()
out.release()
cv2.destroyAllWindows()

print("Tracking finished.")
print("Saved output:", output_path)