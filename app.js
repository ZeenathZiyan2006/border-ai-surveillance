document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const cameraGrid = document.getElementById("camera-grid");
    const snapshotGrid = document.getElementById("snapshot-grid");
    const statTotal = document.getElementById("stat-total");
    const statOnline = document.getElementById("stat-online");
    const statOffline = document.getElementById("stat-offline");
    const countBadge = document.getElementById("camera-count-badge");
    const snapshotCountBadge = document.getElementById("snapshot-count-badge");
    const btnCheckAll = document.getElementById("btn-check-all");
    // Modal Elements
    const cameraModal = document.getElementById("camera-modal");
    const btnOpenModal = document.getElementById("btn-open-modal");
    const btnCloseModal = document.getElementById("btn-close-modal");
    const btnCancelModal = document.getElementById("btn-cancel-modal");
    const addCameraForm = document.getElementById("add-camera-form");
    // Player Elements
    const playerModal = document.getElementById("player-modal");
    const playerTitle = document.getElementById("player-title");
    const streamFeed = document.getElementById("stream-feed");
    const btnClosePlayer = document.getElementById("btn-close-player");
    const btnStopPlayer = document.getElementById("btn-stop-player");
    const btnCaptureSnapshot = document.getElementById("btn-capture-snapshot");
    let currentActiveCameraId = null;
    // Event Listeners
    btnOpenModal.addEventListener("click", () => cameraModal.classList.remove("hidden"));
    btnCloseModal.addEventListener("click", () => cameraModal.classList.add("hidden"));
    btnCancelModal.addEventListener("click", () => cameraModal.classList.add("hidden"));
    btnClosePlayer.addEventListener("click", closePlayer);
    btnStopPlayer.addEventListener("click", closePlayer);
    btnCaptureSnapshot.addEventListener("click", captureFrameToDb);
    btnCheckAll.addEventListener("click", checkAllCameras);
    addCameraForm.addEventListener("submit", handleAddCamera);
    // Initial Fetch
    fetchCameras();
    fetchSnapshots();
    // Fetch cameras list from Flask/SQLite API
    async function fetchCameras() {
        }
    }
    // Fetch snapshots list from SQLite DB
    async function fetchSnapshots() {
        try {
            const res = await fetch("/api/snapshots");
            const data = await res.json();
            if (data.success) {
                renderSnapshots(data.snapshots);
            }
        } catch (err) {
            console.error("Error fetching snapshots:", err);
        }
    }
    // Render Camera Cards
    function renderCameras(cameras) {
        cameraGrid.innerHTML = "";
                    <span class="last-checked">${cam.last_checked ? cam.last_checked.split(" ")[1] || cam.last_checked : "Never"}</span>
                </div>
                <div class="card-actions">
                    <button class="btn btn-secondary btn-sm btn-check" data-id="${cam.id}">⚡ Test Stream</button>
                    <button class="btn btn-danger btn-sm btn-delete" data-id="${cam.id}">🗑 Delete</button>
                    <button class="btn btn-primary btn-sm btn-play" data-id="${cam.id}">▶ Live Stream</button>
                    <button class="btn btn-secondary btn-sm btn-check" data-id="${cam.id}">⚡ Test</button>
                    <button class="btn btn-danger btn-sm btn-delete" data-id="${cam.id}">🗑</button>
                </div>
            `;
            // Attach action handlers
            card.querySelector(".btn-play").addEventListener("click", () => openPlayer(cam));
            card.querySelector(".btn-check").addEventListener("click", () => checkSingleCamera(cam.id, card));
            card.querySelector(".btn-delete").addEventListener("click", () => deleteCamera(cam.id));
        countBadge.textContent = `${cameras.length} Stream(s)`;
    }
    // Render Snapshots Gallery
    function renderSnapshots(snapshots) {
        snapshotGrid.innerHTML = "";
        snapshotCountBadge.textContent = `${snapshots.length} Snapshot(s)`;
        if (snapshots.length === 0) {
            snapshotGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 20px;">No saved frame captures in SQLite DB yet. Use "▶ Live Stream" and click "📸 Capture Frame".</div>`;
            return;
        }
        snapshots.forEach(snap => {
            const card = document.createElement("div");
            card.className = "snapshot-card";
            card.innerHTML = `
                <img class="snapshot-img" src="${snap.image_base64}" alt="Captured Frame">
                <div class="snapshot-info">
                    <span class="snapshot-title">${escapeHtml(snap.camera_name)}</span>
                    <div class="snapshot-meta">
                        <span>${escapeHtml(snap.ai_label)}</span>
                        <span>${escapeHtml(snap.timestamp)}</span>
                    </div>
                    <button class="btn btn-danger btn-sm btn-delete-snap" data-id="${snap.id}" style="margin-top: 6px;">Delete Snapshot</button>
                </div>
            `;
            card.querySelector(".btn-delete-snap").addEventListener("click", () => deleteSnapshot(snap.id));
            snapshotGrid.appendChild(card);
        });
    }
    // Open Live Player
    function openPlayer(camera) {
        currentActiveCameraId = camera.id;
        playerTitle.textContent = `Live Stream: ${camera.name} (${camera.source_type})`;
        streamFeed.src = `/api/stream/${camera.id}?t=${Date.now()}`;
        playerModal.classList.remove("hidden");
    }
    // Close Live Player
    function closePlayer() {
        streamFeed.src = "";
        currentActiveCameraId = null;
        playerModal.classList.add("hidden");
    }
    // Capture Frame to SQLite DB
    async function captureFrameToDb() {
        if (!currentActiveCameraId) return;
        btnCaptureSnapshot.disabled = true;
        btnCaptureSnapshot.textContent = "⏳ Capturing Frame...";
        try {
            const res = await fetch(`/api/cameras/${currentActiveCameraId}/snapshot`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                fetchSnapshots();
            } else {
                alert(data.error || "Failed to capture frame.");
            }
        } catch (err) {
            console.error("Error capturing frame:", err);
        } finally {
            btnCaptureSnapshot.disabled = false;
            btnCaptureSnapshot.textContent = "📸 Capture Frame & Save to SQLite DB";
        }
    }
    // Single camera test
    async function checkSingleCamera(id, cardElement) {
        const btnCheck = cardElement.querySelector(".btn-check");
        btnCheck.disabled = true;
        btnCheck.textContent = "⌛ Testing...";
        btnCheck.textContent = "⌛";
        try {
            const res = await fetch(`/api/cameras/${id}/check`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                fetchCameras();
            }
        } catch (err) {
            console.error("Error checking camera:", err);
        } finally {
            btnCheck.disabled = false;
            btnCheck.textContent = "⚡ Test Stream";
            btnCheck.textContent = "⚡ Test";
        }
    }
        }
    }
    // Delete snapshot
    async function deleteSnapshot(id) {
        try {
            const res = await fetch(`/api/snapshots/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                fetchSnapshots();
            }
        } catch (err) {
            console.error("Error deleting snapshot:", err);
        }
    }
    function escapeHtml(str) {
        return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
});
