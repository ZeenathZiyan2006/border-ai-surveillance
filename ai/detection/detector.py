# ============================================================
# BORDER AI SURVEILLANCE
# AI DETECTION MODULE
#
# Features:
# 1. YOLO object detection
# 2. Person tracking
# 3. Unusual activity rule
# 4. Large screen alert
# 5. Alarm sound
# 6. Evidence screenshot
# 7. Camera ID
# 8. Date and time
# 9. JSON event log
# 10. Faster output video
#
# Backend integration will be done separately by the backend
# team member.
# ============================================================

from ultralytics import YOLO
import cv2
import os
import json
import math
import time
import threading
from datetime import datetime


# ============================================================
# 1. PROJECT PATHS
# ============================================================

DETECTION_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

INPUT_VIDEO = os.path.join(
    DETECTION_DIR,
    "test_video.mp4"
)

OUTPUT_VIDEO = os.path.join(
    DETECTION_DIR,
    "detected_output_fast.mp4"
)

MODEL_PATH = os.path.join(
    DETECTION_DIR,
    "yolo11n.pt"
)

EVIDENCE_DIR = os.path.join(
    DETECTION_DIR,
    "evidence"
)

LOG_DIR = os.path.join(
    DETECTION_DIR,
    "logs"
)

EVENT_LOG = os.path.join(
    LOG_DIR,
    "security_events.json"
)


# ============================================================
# 2. CREATE REQUIRED FOLDERS
# ============================================================

os.makedirs(
    EVIDENCE_DIR,
    exist_ok=True
)

os.makedirs(
    LOG_DIR,
    exist_ok=True
)


# ============================================================
# 3. CAMERA SETTINGS
# ============================================================

CAMERA_ID = "CAM-01"


# ============================================================
# 4. VIDEO SPEED
# ============================================================
#
# 1.0 = normal
# 1.5 = 1.5x faster
# 2.0 = 2x faster
# 3.0 = 3x faster
#
# You can change this number.
# ============================================================

VIDEO_SPEED = 2.0


# ============================================================
# 5. YOLO SETTINGS
# ============================================================

CONFIDENCE_THRESHOLD = 0.40


# ============================================================
# 6. UNUSUAL ACTIVITY SETTINGS
# ============================================================
#
# This prototype looks for multiple people staying unusually
# close together for a period of time.
#
# It does NOT identify a specific crime.
# ============================================================

PROXIMITY_DISTANCE = 120

PROXIMITY_REQUIRED_SECONDS = 2

ALERT_COOLDOWN_SECONDS = 10


# ============================================================
# 7. LARGE ALERT SETTINGS
# ============================================================

ALERT_DISPLAY_SECONDS = 5


# ============================================================
# 8. OBJECT CLASSES
# ============================================================

TARGET_CLASSES = {

    0: "person",

    1: "bicycle",

    2: "car",

    3: "motorcycle",

    5: "bus",

    7: "truck"
}


# ============================================================
# 9. LOAD YOLO MODEL
# ============================================================

print()
print("==========================================")
print("       BORDER AI SURVEILLANCE")
print("==========================================")
print()

print("Loading YOLO model...")

model = YOLO(
    MODEL_PATH
)

print(
    "YOLO model loaded successfully."
)


# ============================================================
# 10. CHECK INPUT VIDEO
# ============================================================

if not os.path.exists(
    INPUT_VIDEO
):

    print()
    print(
        "ERROR: test_video.mp4 was not found."
    )

    print(
        "Expected location:"
    )

    print(
        INPUT_VIDEO
    )

    exit()


# ============================================================
# 11. OPEN VIDEO
# ============================================================

cap = cv2.VideoCapture(
    INPUT_VIDEO
)

if not cap.isOpened():

    print()
    print(
        "ERROR: Could not open video."
    )

    exit()


# ============================================================
# 12. VIDEO INFORMATION
# ============================================================

width = int(
    cap.get(
        cv2.CAP_PROP_FRAME_WIDTH
    )
)

height = int(
    cap.get(
        cv2.CAP_PROP_FRAME_HEIGHT
    )
)

original_fps = cap.get(
    cv2.CAP_PROP_FPS
)

if original_fps <= 0:

    original_fps = 30


total_frames = int(
    cap.get(
        cv2.CAP_PROP_FRAME_COUNT
    )
)


# ============================================================
# 13. OUTPUT FPS
# ============================================================
#
# Increasing output FPS makes the saved video play faster
# when all frames are retained.
#
# Example:
# Original = 30 FPS
# Speed = 2x
# Output = 60 FPS
# ============================================================

output_fps = (
    original_fps
    * VIDEO_SPEED
)


print()
print("------------------------------------------")
print("VIDEO INFORMATION")
print("------------------------------------------")

print(
    f"Camera ID       : {CAMERA_ID}"
)

print(
    f"Width           : {width}"
)

print(
    f"Height          : {height}"
)

print(
    f"Original FPS    : {original_fps:.2f}"
)

print(
    f"Playback speed  : {VIDEO_SPEED}x"
)

print(
    f"Output FPS      : {output_fps:.2f}"
)

print(
    f"Total frames    : {total_frames}"
)

print("------------------------------------------")
print()


# ============================================================
# 14. OUTPUT VIDEO
# ============================================================

fourcc = cv2.VideoWriter_fourcc(
    *"mp4v"
)

out = cv2.VideoWriter(

    OUTPUT_VIDEO,

    fourcc,

    output_fps,

    (width, height)
)


# ============================================================
# 15. ALERT STATE
# ============================================================

alert_active = False

alert_until = 0

last_alert_time = 0

proximity_start_time = None


# ============================================================
# 16. STATISTICS
# ============================================================

frame_number = 0

object_counts = {

    "person": 0,

    "bicycle": 0,

    "car": 0,

    "motorcycle": 0,

    "bus": 0,

    "truck": 0
}


# ============================================================
# 17. ALARM FUNCTION
# ============================================================

def play_alarm():

    try:

        import winsound

        for i in range(3):

            winsound.Beep(
                1000,
                600
            )

            time.sleep(
                0.15
            )

    except Exception as error:

        print(
            "Alarm error:",
            error
        )


# ============================================================
# 18. SAVE EVENT TO JSON
# ============================================================

def save_event(event):

    events = []

    if os.path.exists(
        EVENT_LOG
    ):

        try:

            with open(
                EVENT_LOG,
                "r",
                encoding="utf-8"
            ) as file:

                events = json.load(
                    file
                )

        except Exception:

            events = []


    events.append(
        event
    )


    with open(
        EVENT_LOG,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            events,
            file,
            indent=4
        )


# ============================================================
# 19. TRIGGER COMPLETE ALERT
# ============================================================

def trigger_alert(

    event_type,

    message,

    confidence,

    frame,

    frame_number,

    video_time

):

    global alert_active

    global alert_until

    global last_alert_time


    # --------------------------------------------------------
    # DATE AND TIME
    # --------------------------------------------------------

    now = datetime.now()


    date_text = now.strftime(
        "%Y-%m-%d"
    )

    time_text = now.strftime(
        "%H:%M:%S"
    )


    # --------------------------------------------------------
    # SAVE EVIDENCE IMAGE
    # --------------------------------------------------------

    evidence_filename = (

        f"{event_type}_"

        f"{now.strftime('%Y%m%d_%H%M%S')}_"

        f"frame_{frame_number}.jpg"

    )


    evidence_path = os.path.join(

        EVIDENCE_DIR,

        evidence_filename

    )


    cv2.imwrite(

        evidence_path,

        frame

    )


    # --------------------------------------------------------
    # EVENT ID
    # --------------------------------------------------------

    event_id = now.strftime(
        "%Y%m%d%H%M%S%f"
    )


    # --------------------------------------------------------
    # EVENT JSON
    # --------------------------------------------------------

    event = {

        "event_id":
            event_id,

        "camera_id":
            CAMERA_ID,

        "event_type":
            event_type,

        "severity":
            "HIGH",

        "message":
            message,

        "confidence":
            round(
                float(confidence),
                3
            ),

        "date":
            date_text,

        "time":
            time_text,

        "timestamp":
            now.isoformat(),

        "frame_number":
            frame_number,

        "video_time_seconds":
            round(
                video_time,
                2
            ),

        "evidence_file":
            evidence_path,

        "status":
            "REVIEW_REQUIRED"

    }


    # --------------------------------------------------------
    # SAVE EVENT
    # --------------------------------------------------------

    save_event(
        event
    )


    # --------------------------------------------------------
    # START ALARM
    # --------------------------------------------------------

    threading.Thread(

        target=play_alarm,

        daemon=True

    ).start()


    # --------------------------------------------------------
    # ACTIVATE LARGE SCREEN ALERT
    # --------------------------------------------------------

    alert_active = True

    alert_until = (

        time.time()

        + ALERT_DISPLAY_SECONDS

    )

    last_alert_time = (
        time.time()
    )


    # --------------------------------------------------------
    # TERMINAL OUTPUT
    # --------------------------------------------------------

    print()
    print()
    print("############################################")
    print("             🚨 SECURITY ALERT")
    print("############################################")

    print(
        f"Camera     : {CAMERA_ID}"
    )

    print(
        f"Event      : {event_type}"
    )

    print(
        f"Date       : {date_text}"
    )

    print(
        f"Time       : {time_text}"
    )

    print(
        f"Confidence : {confidence:.1%}"
    )

    print(
        f"Frame      : {frame_number}"
    )

    print(
        f"Evidence   : {evidence_path}"
    )

    print(
        "Status     : REVIEW REQUIRED"
    )

    print("############################################")
    print()


# ============================================================
# 20. START VIDEO PROCESSING
# ============================================================

print(
    "Starting AI surveillance..."
)

print(
    "Press Q to stop."
)

print()


# ============================================================
# 21. MAIN LOOP
# ============================================================

while True:

    ret, frame = cap.read()


    if not ret:

        break


    frame_number += 1


    video_time = (

        frame_number
        / original_fps

    )


    # ========================================================
    # YOLO TRACKING
    # ========================================================

    results = model.track(

        frame,

        conf=CONFIDENCE_THRESHOLD,

        persist=True,

        verbose=False

    )


    result = results[0]


    # ========================================================
    # CURRENT PEOPLE
    # ========================================================

    current_people = []


    # ========================================================
    # PROCESS DETECTIONS
    # ========================================================

    if result.boxes is not None:

        for box in result.boxes:

            class_id = int(
                box.cls[0]
            )


            confidence = float(
                box.conf[0]
            )


            if class_id not in TARGET_CLASSES:

                continue


            object_name = (

                TARGET_CLASSES[
                    class_id
                ]

            )


            # ------------------------------------------------
            # BOUNDING BOX
            # ------------------------------------------------

            x1, y1, x2, y2 = map(

                int,

                box.xyxy[0].tolist()

            )


            # ------------------------------------------------
            # CENTER
            # ------------------------------------------------

            center_x = int(

                (x1 + x2)
                / 2

            )


            center_y = int(

                (y1 + y2)
                / 2

            )


            # ------------------------------------------------
            # TRACK ID
            # ------------------------------------------------

            track_id = None


            if box.id is not None:

                track_id = int(
                    box.id[0]
                )


            # ------------------------------------------------
            # PERSON INFORMATION
            # ------------------------------------------------

            if object_name == "person":

                current_people.append({

                    "id":
                        track_id,

                    "x":
                        center_x,

                    "y":
                        center_y,

                    "confidence":
                        confidence

                })


            # ------------------------------------------------
            # COUNT
            # ------------------------------------------------

            object_counts[
                object_name
            ] += 1


            # ------------------------------------------------
            # LABEL
            # ------------------------------------------------

            if track_id is not None:

                label = (

                    f"{object_name} "
                    f"ID:{track_id} "
                    f"{confidence:.0%}"

                )

            else:

                label = (

                    f"{object_name} "
                    f"{confidence:.0%}"

                )


            # ------------------------------------------------
            # DRAW BOX
            # ------------------------------------------------

            cv2.rectangle(

                frame,

                (x1, y1),

                (x2, y2),

                (0, 255, 0),

                2

            )


            cv2.putText(

                frame,

                label,

                (
                    x1,
                    max(
                        y1 - 10,
                        20
                    )
                ),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.6,

                (0, 255, 0),

                2

            )


            # ------------------------------------------------
            # CENTER POINT
            # ------------------------------------------------

            cv2.circle(

                frame,

                (
                    center_x,
                    center_y
                ),

                4,

                (255, 0, 0),

                -1

            )


    # ========================================================
    # 22. BEHAVIOR ANALYSIS
    # ========================================================

    proximity_detected = False


    if len(current_people) >= 2:

        for i in range(
            len(current_people)
        ):

            for j in range(

                i + 1,

                len(current_people)

            ):

                person_a = (
                    current_people[i]
                )

                person_b = (
                    current_people[j]
                )


                dx = (

                    person_a["x"]
                    - person_b["x"]

                )


                dy = (

                    person_a["y"]
                    - person_b["y"]

                )


                distance = math.sqrt(

                    dx * dx
                    + dy * dy

                )


                if distance < PROXIMITY_DISTANCE:

                    proximity_detected = True


                    # ----------------------------------------
                    # DRAW CONNECTION
                    # ----------------------------------------

                    cv2.line(

                        frame,

                        (
                            person_a["x"],
                            person_a["y"]
                        ),

                        (
                            person_b["x"],
                            person_b["y"]
                        ),

                        (0, 0, 255),

                        3

                    )


                    cv2.putText(

                        frame,

                        "UNUSUAL PROXIMITY",

                        (20, 140),

                        cv2.FONT_HERSHEY_SIMPLEX,

                        0.8,

                        (0, 0, 255),

                        2

                    )


    # ========================================================
    # 23. PROXIMITY TIMER
    # ========================================================

    if proximity_detected:

        if proximity_start_time is None:

            proximity_start_time = (
                time.time()
            )

    else:

        proximity_start_time = None


    # ========================================================
    # 24. CHECK FOR ALERT
    # ========================================================

    if proximity_start_time is not None:

        duration = (

            time.time()
            - proximity_start_time

        )


        if (

            duration
            >= PROXIMITY_REQUIRED_SECONDS

        ):

            if (

                time.time()
                - last_alert_time
                >= ALERT_COOLDOWN_SECONDS

            ):

                trigger_alert(

                    event_type=
                        "UNUSUAL_PROXIMITY",

                    message=(

                        "Multiple people remained "
                        "unusually close together "
                        "for a sustained period. "
                        "Human review required."

                    ),

                    confidence=0.70,

                    frame=frame,

                    frame_number=
                        frame_number,

                    video_time=
                        video_time

                )


                proximity_start_time = None


    # ========================================================
    # 25. LARGE SCREEN ALERT
    # ========================================================

    if (

        alert_active
        and time.time()
        < alert_until

    ):

        # ----------------------------------------------------
        # RED BORDER
        # ----------------------------------------------------

        cv2.rectangle(

            frame,

            (0, 0),

            (
                width - 1,
                height - 1
            ),

            (0, 0, 255),

            12

        )


        # ----------------------------------------------------
        # ALERT BANNER
        # ----------------------------------------------------

        cv2.rectangle(

            frame,

            (0, 0),

            (
                width,
                110
            ),

            (0, 0, 255),

            -1

        )


        cv2.putText(

            frame,

            "!!! SECURITY ALERT !!!",

            (30, 70),

            cv2.FONT_HERSHEY_SIMPLEX,

            1.3,

            (255, 255, 255),

            4

        )


    else:

        alert_active = False


    # ========================================================
    # 26. CAMERA INFORMATION
    # ========================================================

    now_display = datetime.now()


    cv2.putText(

        frame,

        f"Camera: {CAMERA_ID}",

        (20, height - 75),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.6,

        (255, 255, 255),

        2

    )


    cv2.putText(

        frame,

        (
            "Date: "
            + now_display.strftime(
                "%Y-%m-%d"
            )
        ),

        (20, height - 50),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.6,

        (255, 255, 255),

        2

    )


    cv2.putText(

        frame,

        (
            "Time: "
            + now_display.strftime(
                "%H:%M:%S"
            )
        ),

        (20, height - 25),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.6,

        (255, 255, 255),

        2

    )


    # ========================================================
    # 27. SAVE OUTPUT FRAME
    # ========================================================

    out.write(
        frame
    )


    # ========================================================
    # 28. SHOW VIDEO
    # ========================================================

    cv2.imshow(

        "BORDER AI SURVEILLANCE",

        frame

    )


    # ========================================================
    # 29. KEYBOARD
    # ========================================================

    key = cv2.waitKey(1) & 0xFF


    if key == ord("q"):

        break


# ============================================================
# 30. CLEANUP
# ============================================================

cap.release()

out.release()

cv2.destroyAllWindows()


# ============================================================
# 31. FINAL REPORT
# ============================================================

print()
print("==========================================")
print("       DETECTION COMPLETED")
print("==========================================")

print(
    f"Camera ID       : {CAMERA_ID}"
)

print(
    f"Playback speed  : {VIDEO_SPEED}x"
)

print(
    f"Output video    : {OUTPUT_VIDEO}"
)

print(
    f"Evidence folder : {EVIDENCE_DIR}"
)

print(
    f"Event log       : {EVENT_LOG}"
)

print()
print("Object statistics:")
print("------------------------------------------")


for object_name, count in object_counts.items():

    print(
        f"{object_name:<12}: {count}"
    )


print("------------------------------------------")
print()
print(
    "AI surveillance finished successfully."
)