"""
app.py
------
Flask REST API server for CCTV Video Module web frontend and SQLite database integration.
"""
import sys
import os
from flask import Flask, jsonify, request, send_from_directory
import base64
import time
import cv2
from flask import Flask, jsonify, request, send_from_directory, Response
import db
from camera_manager import check_camera
from video_processor import send_frame_to_ai
# Ensure UTF-8 output encoding for Windows command line emoji support
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
# Initialize Flask app serving static folder
app = Flask(__name__, static_folder="static", static_url_path="")
# Initialize SQLite database schema
db.init_db()
def generate_mjpeg_stream(camera_id: int):
    """Generates an MJPEG byte stream from OpenCV VideoCapture for browser streaming."""
    camera = db.get_camera_by_id(camera_id)
    if not camera:
        return
    source = camera["source"]
    if str(source).isdigit():
        source = int(source)
    cap = cv2.VideoCapture(source)
    is_file = isinstance(source, str) and not source.startswith("rtsp://")
    try:
        while True:
            ret, frame = cap.read()
            if not ret or frame is None:
                if is_file and cap.isOpened():
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                else:
                    break
            # Process frame through AI hook interface
            processed_frame = send_frame_to_ai(frame)
            # Encode frame as JPEG
            ret, buffer = cv2.imencode('.jpg', processed_frame)
            if not ret:
                continue
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.03)  # ~30 FPS throttle
    finally:
        cap.release()
@app.route("/")
def serve_index():
    """Serves the main HTML dashboard."""
    return send_from_directory(app.static_folder, "index.html")
@app.route("/api/cameras", methods=["GET"])
def list_cameras():
    """Returns a list of all configured cameras from SQLite database."""
    cameras = db.get_all_cameras()
    return jsonify({"success": True, "cameras": cameras})
@app.route("/api/cameras", methods=["POST"])
def create_camera():
    """Adds a new camera configuration to the SQLite database."""
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    source_raw = data.get("source", "").strip()
    source_type = data.get("source_type", "WEBCAM").upper()
    if not name or not source_raw:
        return jsonify({"success": False, "error": "Camera Name and Source are required."}), 400
    # Parse integer webcam index if webcam type
    if source_type == "WEBCAM" and source_raw.isdigit():
        source = int(source_raw)
    else:
        source = source_raw
    camera = db.add_camera(name, str(source), source_type)
    return jsonify({"success": True, "camera": camera}), 201
@app.route("/api/cameras/<int:camera_id>", methods=["DELETE"])
def remove_camera(camera_id: int):
    """Deletes a camera from the SQLite database."""
    deleted = db.delete_camera(camera_id)
    if deleted:
        return jsonify({"success": True, "message": f"Camera {camera_id} deleted."})
    return jsonify({"success": False, "error": "Camera not found."}), 404
@app.route("/api/cameras/<int:camera_id>/check", methods=["POST"])
def check_single_camera(camera_id: int):
    """Executes live OpenCV health check for a specific camera and updates SQLite DB."""
    camera = db.get_camera_by_id(camera_id)
    if not camera:
        return jsonify({"success": False, "error": "Camera not found."}), 404
    source_val = camera["source"]
    if str(source_val).isdigit():
        source_val = int(source_val)
    # Perform empirical OpenCV test
    is_online = check_camera(camera["name"], source_val)
    status_str = "ONLINE" if is_online else "OFFLINE"
    updated_camera = db.update_camera_status(camera_id, status_str)
    return jsonify({"success": True, "camera": updated_camera})
@app.route("/api/cameras/check-all", methods=["POST"])
def check_all_db_cameras():
    """Runs health check on all cameras in SQLite database."""
    cameras = db.get_all_cameras()
    updated_list = []
    for cam in cameras:
        source_val = cam["source"]
        if str(source_val).isdigit():
            source_val = int(source_val)
        is_online = check_camera(cam["name"], source_val)
        status_str = "ONLINE" if is_online else "OFFLINE"
        updated_cam = db.update_camera_status(cam["id"], status_str)
        if updated_cam:
            updated_list.append(updated_cam)
    return jsonify({"success": True, "cameras": updated_list})
@app.route("/api/stream/<int:camera_id>")
def stream_video(camera_id: int):
    """Live MJPEG video streaming route for web browsers."""
    return Response(generate_mjpeg_stream(camera_id), mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route("/api/cameras/<int:camera_id>/snapshot", methods=["POST"])
def capture_frame_to_db(camera_id: int):
    """Captures the current frame from OpenCV and saves it as Base64 into SQLite database."""
    camera = db.get_camera_by_id(camera_id)
    if not camera:
        return jsonify({"success": False, "error": "Camera not found."}), 404
    source = camera["source"]
    if str(source).isdigit():
        source = int(source)
    cap = cv2.VideoCapture(source)
    ret, frame = cap.read()
    cap.release()
    if not ret or frame is None:
        return jsonify({"success": False, "error": "Unable to capture frame from video source."}), 400
    # Process frame via AI model interface hook
    processed_frame = send_frame_to_ai(frame)
    # Encode frame to JPEG Base64
    ret, buffer = cv2.imencode('.jpg', processed_frame)
    if not ret:
        return jsonify({"success": False, "error": "Failed to encode frame to JPEG."}), 500
    img_b64 = base64.b64encode(buffer).decode('utf-8')
    image_data_url = f"data:image/jpeg;base64,{img_b64}"
    snapshot = db.save_snapshot(camera_id, camera["name"], image_data_url, "AI Stream Capture")
    return jsonify({"success": True, "snapshot": snapshot}), 201
@app.route("/api/snapshots", methods=["GET"])
def get_snapshots():
    """Retrieves all frame snapshots saved in the SQLite database."""
    snapshots = db.get_all_snapshots()
    return jsonify({"success": True, "snapshots": snapshots})
@app.route("/api/snapshots/<int:snapshot_id>", methods=["DELETE"])
def delete_snapshot_endpoint(snapshot_id: int):
    """Deletes a frame snapshot from the SQLite database."""
    deleted = db.delete_snapshot(snapshot_id)
    if deleted:
        return jsonify({"success": True, "message": f"Snapshot {snapshot_id} deleted."})
    return jsonify({"success": False, "error": "Snapshot not found."}), 404
if __name__ == "__main__":
    print("==================================================")
    print("   CCTV WEB DASHBOARD & PYTHON SQLITE BACKEND    ")
    print("==================================================")
    print("Server running on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
