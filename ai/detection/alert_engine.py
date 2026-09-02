import os
import json
from datetime import datetime

# ============================================================
# BORDER AI SURVEILLANCE
# ALERT ENGINE
# ============================================================

DETECTION_DIR = os.path.dirname(os.path.abspath(__file__))

EVIDENCE_DIR = os.path.join(DETECTION_DIR, "evidence")
LOG_DIR = os.path.join(DETECTION_DIR, "logs")

ALERT_LOG = os.path.join(LOG_DIR, "alerts.json")

os.makedirs(EVIDENCE_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)


def create_alert(
    event_type,
    message,
    confidence=0.0,
    camera_id="CAM-01",
    frame_number=None,
    evidence_path=None
):
    """
    Create and store a suspicious-activity alert.
    """

    alert = {
        "alert_id": datetime.now().strftime("%Y%m%d%H%M%S%f"),
        "camera_id": camera_id,
        "event_type": event_type,
        "message": message,
        "confidence": round(float(confidence), 3),
        "frame_number": frame_number,
        "timestamp": datetime.now().isoformat(),
        "evidence": evidence_path,
        "status": "REVIEW_REQUIRED"
    }

    # Load previous alerts
    alerts = []

    if os.path.exists(ALERT_LOG):

        try:
            with open(
                ALERT_LOG,
                "r",
                encoding="utf-8"
            ) as file:

                alerts = json.load(file)

        except (json.JSONDecodeError, FileNotFoundError):

            alerts = []

    # Add new alert
    alerts.append(alert)

    # Save alerts
    with open(
        ALERT_LOG,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            alerts,
            file,
            indent=4
        )

    # Display alert
    print()
    print("==========================================")
    print("🚨 SUSPICIOUS ACTIVITY ALERT")
    print("==========================================")
    print(f"Camera     : {camera_id}")
    print(f"Event      : {event_type}")
    print(f"Message    : {message}")
    print(f"Confidence : {confidence:.1%}")
    print(f"Time       : {alert['timestamp']}")
    print(f"Evidence   : {evidence_path}")
    print("Status     : REVIEW REQUIRED")
    print("==========================================")
    print()

    return alert


if __name__ == "__main__":

    print("Alert Engine Test")

    create_alert(
        event_type="TEST_ALERT",
        message="Alert engine is working correctly.",
        confidence=0.95,
        camera_id="CAM-01"
    )

    print("Alert engine test completed.")