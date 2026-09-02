"""
db.py
-----
Python SQLite database manager for storing and managing CCTV camera configurations and health status.
"""
import sqlite3
import datetime
from typing import List, Dict, Any, Optional
DB_FILE = "cameras.db"
def get_db_connection() -> sqlite3.Connection:
    """Creates a connection to the SQLite database with Row factory enabled."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn
def init_db() -> None:
    """Initializes the database schema and populates default cameras if empty."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cameras (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                source TEXT NOT NULL,
                source_type TEXT NOT NULL,
                status TEXT DEFAULT 'UNKNOWN',
                last_checked TEXT
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                camera_id INTEGER NOT NULL,
                camera_name TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                image_base64 TEXT NOT NULL,
                ai_label TEXT DEFAULT 'Captured Frame',
                FOREIGN KEY (camera_id) REFERENCES cameras (id) ON DELETE CASCADE
            )
        """)
        # Check if table is empty, seed with initial configurations
        cursor.execute("SELECT COUNT(*) FROM cameras")
        count = cursor.fetchone()[0]
        if count == 0:
            default_cameras = [
                ("Camera 01", "0", "WEBCAM", "UNKNOWN"),
                ("Camera 02", "test.mp4", "MP4", "UNKNOWN"),
                ("Camera 03", "rtsp://username:password@192.168.1.100:554/stream", "RTSP", "OFFLINE"),
            ]
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.executemany(
                "INSERT INTO cameras (name, source, source_type, status, last_checked) VALUES (?, ?, ?, ?, ?)",
                [(name, src, stype, status, now) for name, src, stype, status in default_cameras]
            )
            conn.commit()
def get_all_cameras() -> List[Dict[str, Any]]:
    """Retrieves all cameras from the SQLite database."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cameras ORDER BY id ASC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
def get_camera_by_id(camera_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves a single camera by ID."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cameras WHERE id = ?", (camera_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
def add_camera(name: str, source: str, source_type: str) -> Dict[str, Any]:
    """Adds a new camera to the SQLite database."""
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO cameras (name, source, source_type, status, last_checked) VALUES (?, ?, ?, 'UNKNOWN', ?)",
            (name, source, source_type, now)
        )
        conn.commit()
        new_id = cursor.lastrowid
    return get_camera_by_id(new_id)  # type: ignore
def delete_camera(camera_id: int) -> bool:
    """Deletes a camera by ID from the SQLite database."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM cameras WHERE id = ?", (camera_id,))
        conn.commit()
        return cursor.rowcount > 0
def update_camera_status(camera_id: int, status: str) -> Optional[Dict[str, Any]]:
    """Updates status and last_checked timestamp for a specific camera."""
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE cameras SET status = ?, last_checked = ? WHERE id = ?",
            (status, now, camera_id)
        )
        conn.commit()
    return get_camera_by_id(camera_id)
# ==============================================================================
# FRAME SNAPSHOT DB OPERATIONS
# ==============================================================================
def save_snapshot(camera_id: int, camera_name: str, image_base64: str, ai_label: str = "Captured Frame") -> Dict[str, Any]:
    """Saves a captured video frame as JPEG base64 into the SQLite database."""
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO snapshots (camera_id, camera_name, timestamp, image_base64, ai_label) VALUES (?, ?, ?, ?, ?)",
            (camera_id, camera_name, now, image_base64, ai_label)
        )
        conn.commit()
        new_id = cursor.lastrowid
        cursor.execute("SELECT * FROM snapshots WHERE id = ?", (new_id,))
        row = cursor.fetchone()
        return dict(row)
def get_all_snapshots() -> List[Dict[str, Any]]:
    """Retrieves all saved video frame snapshots from the SQLite database."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM snapshots ORDER BY id DESC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
def delete_snapshot(snapshot_id: int) -> bool:
    """Deletes a snapshot record from the SQLite database."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM snapshots WHERE id = ?", (snapshot_id,))
        conn.commit()
        return cursor.rowcount > 0
