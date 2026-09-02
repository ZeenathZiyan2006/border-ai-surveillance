from ultralytics import YOLO
import cv2
import os
import math

print("Starting AI tracker...")
track_history = {}
inside_ids = set()
loitering_ids = set()

# Load YOLO model
model = YOLO("yolo11n.pt")

# Open input video
input_path = "videos/test.mp4"
cap = cv2.VideoCapture(input_path)

if not cap.isOpened():
    print("ERROR: Could not open video.")
    exit()

print("Video opened successfully.")

# Create output folder
os.makedirs("output", exist_ok=True)
alert_file = open("output/alerts.txt", "a")
# Define restricted zone
zone_x1 = 300
zone_y1 = 200
zone_x2 = 800
zone_y2 = 700

# Get video information
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)

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

    if not ret:
        break

    # Detect and track objects
    results = model.track(
        frame,
        persist=True,
        tracker="bytetrack.yaml"
    )

    # Get the first result
    result = results[0]

    # Draw boxes and IDs
    annotated_frame = result.plot()
    cv2.rectangle(
        annotated_frame,
        (zone_x1,zone_y1),
        (zone_x2,zone_y2),
        (255,0,0),
        2
    )

    # Check if tracking IDs exist
    if result.boxes.id is not None:

        # Get tracking IDs
        track_ids = result.boxes.id.int().cpu().tolist()

        # Get bounding boxes
        boxes = result.boxes.xyxy.cpu().tolist()

        # Process every tracked object
        for track_id, box in zip(track_ids, boxes):

            x1, y1, x2, y2 = map(int, box)

            # Calculate center point
            center_x = int((x1 + x2) / 2)
            center_y = int((y1 + y2) / 2)
            if track_id not in track_history:
                track_history[track_id]=[]

                track_history[track_id].append((center_x,center_y))
                track_history[track_id]=track_history[track_id][-30:]
                if len(track_history[track_id]) >= 30:
                     old_x, old_y = track_history[track_id][0]
                     distance = math.sqrt(
                          (center_x - old_x) ** 2 +
                          (center_y - old_y) ** 2
                          )
                     print(
                         f"ID {track_id} | Movement distance: {distance:.2f}"
                         )
                     if distance < 30:
                          if track_id not in loitering_ids:
                              print(
                                   f"⚠️ LOITERING ALERT: "
                                   f"ID {track_id} may be loitering!"
                                   )
                              loitering_ids.add(track_id)
                              alert_text = "LOITERING ALERT"
                              alert_file.write(
                                    f"LOITERING ALERT | ID {track_id} | Center ({center_x}, {center_y})\n"
                                    )
                              alert_file.flush()
                else:
                              if track_id in loitering_ids:
                                  loitering_ids.remove(track_id)
                inside_zone = (
                    zone_x1 <= center_x <= zone_x2
                    and
                    zone_y1 <= center_y <= zone_y2
                    )
                alert_text = ""
                print(
                    f"ID {track_id} | Center ({center_x}, {center_y}) | "
                    f"Inside zone: {inside_zone}"
                    )
                if inside_zone:
                     if track_id not in inside_ids:
                        print(
                            f"🚨 INTRUSION ALERT: "
                            f"ID {track_id} entered the restricted zone!"
                            )
                        inside_ids.add(track_id)
                        alert_text = "INTRUSION ALERT"
                        alert_file.write(
                               f"INTRUSION ALERT | ID {track_id} | Center ({center_x}, {center_y})\n"
                               )
                        alert_file.flush()
                        cv2.putText(annotated_frame, alert_text, (50, 50),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1,
                                    (0, 0, 255), 2)
                else:
                        if track_id in inside_ids:
                            inside_ids.remove(track_id)
                            print(
                                f"ID: {track_id} | "
                                f"Center: ({center_x}, {center_y})"
                                )
                            if alert_text:
                                 cv2.putText(
                                      annotated_frame,
                                      alert_text,
                                      (20, 50),
                                      cv2.FONT_HERSHEY_SIMPLEX,1,(0, 0, 255),
                                      2
                                      )
                                 cv2.imshow("AI Tracking", annotated_frame)

    out.write(annotated_frame)

    # Press Q to stop
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Release resources
alert_file.close()
cap.release()
out.release()
cv2.destroyAllWindows()

print("Tracking finished.")
print("Saved:", output_path)