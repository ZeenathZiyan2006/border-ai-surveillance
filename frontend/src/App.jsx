import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Eye,
  LayoutDashboard,
  Map,
  Menu,
  Monitor,
  Radio,
  Shield,
  ShieldAlert,
  Signal,
  Target,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";
import "./App.css";
const API_BASE_URL = "http://127.0.0.1:8001";
const detectionData = [
  { time: "06:00", count: 12 },
  { time: "08:00", count: 28 },
  { time: "10:00", count: 25 },
  { time: "12:00", count: 42 },
  { time: "14:00", count: 31 },
  { time: "16:00", count: 55 },
  { time: "18:00", count: 48 },
  { time: "20:00", count: 67 },
];

const cameras = [
  {
    id: 1,
    name: "NORTH GATE",
    location: "Sector A-01",
    status: "online",
    people: 7,
    signal: 98,
  },
  {
    id: 2,
    name: "SOUTH GATE",
    location: "Sector B-04",
    status: "online",
    people: 4,
    signal: 94,
  },
  {
    id: 3,
    name: "EAST PERIMETER",
    location: "Sector C-07",
    status: "online",
    people: 9,
    signal: 91,
  },
  {
    id: 4,
    name: "WEST PERIMETER",
    location: "Sector D-02",
    status: "offline",
    people: 0,
    signal: 0,
  },
];

const initialAlerts = [
  {
    id: 1,
    type: "INTRUSION",
    severity: "HIGH",
    message: "Unauthorized person detected",
    camera: "North Gate",
    time: "19:21:15",
    active: true,
  },
  {
    id: 2,
    type: "LOITERING",
    severity: "MEDIUM",
    message: "Unusual prolonged presence",
    camera: "East Perimeter",
    time: "19:18:42",
    active: true,
  },
  {
    id: 3,
    type: "MOTION",
    severity: "LOW",
    message: "Motion detected in restricted zone",
    camera: "South Gate",
    time: "19:12:08",
    active: true,
  },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [alerts, setAlerts] = useState([]);
  const [cameraData, setCameraData] = useState(cameras);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState("CHECKING");

useEffect(() => {
  fetch(`${API_BASE_URL}/health`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Backend unavailable");
      }
      return response.json();
    })
    .then(() => {
      setBackendStatus("CONNECTED");
    })
    .catch(() => {
      setBackendStatus("OFFLINE");
    });
}, []);
  useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);

  fetch(`${API_BASE_URL}/cameras/`)
    .then((response) => response.json())
    .then((data) => {
      if (data.cameras) {
        setCameraData(data.cameras);
      }
    })
    .catch((error) => {
      console.error("Camera API error:", error);
    });
    fetch(`${API_BASE_URL}/alerts/`)
    .then((response) => response.json())
    .then((data) => {
      if (data.alerts) {
        const formattedAlerts = data.alerts.map((alert) => ({
          id: alert.id,
          type: alert.alert_type?.toUpperCase() || "ALERT",
          severity: alert.severity?.toUpperCase() || "MEDIUM",
          message: alert.message,
          camera: `Camera ${alert.camera_id}`,
          time: new Date().toLocaleTimeString(),
          active: true,
        }));

        setAlerts(formattedAlerts);
      }
    })
    .catch((error) => {
      console.error("Alerts API error:", error);
    });
  return () => clearInterval(timer);
}, []);

  const activeAlerts = alerts.filter((alert) => alert.active).length;

  const resolveAlert = (id) => {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id ? { ...alert, active: false } : alert
      )
    );
  };

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Live Monitoring", icon: Video },
    { name: "Cameras", icon: Camera },
    { name: "Detections", icon: Target },
    { name: "Alert Center", icon: Bell, badge: activeAlerts },
    { name: "Analytics", icon: Activity },
  ];

  return (
    <div className="app">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Shield size={25} />
          </div>
          <div>
            <h1>BORDER<span>AI</span></h1>
            <p>SECURITY COMMAND</p>
          </div>
          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="system-mini-status">
          <span className="status-pulse"></span>
          <div>
            <strong>
  SYSTEM {backendStatus}
</strong>
            <small>All services operational</small>
          </div>
        </div>

        <nav>
          <p className="nav-label">COMMAND CENTER</p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => {
                  setActivePage(item.name);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.name}</span>
                {item.badge > 0 && (
                  <span className="nav-badge">{item.badge}</span>
                )}
                {activePage === item.name && (
                  <ChevronRight className="nav-arrow" size={16} />
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="connection">
            <Radio size={16} />
            <span>AI ENGINE</span>
            <b>CONNECTED</b>
          </div>
          <div className="version">BORDER AI v1.0.0</div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={23} />
          </button>

          <div className="page-heading">
            <span className="eyebrow">SECURITY OPERATIONS</span>
            <h2>{activePage}</h2>
          </div>

          <div className="topbar-right">
            <div className="live-indicator">
              <span></span>
              LIVE
            </div>

            <div className="clock">
              <Clock3 size={17} />
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>

            <div className="operator">
              <div className="operator-avatar">OP</div>
              <div>
                <strong>OPERATOR</strong>
                <small>Control Room</small>
              </div>
            </div>
          </div>
        </header>

        <div className="content">
          {activePage === "Dashboard" && (
            <Dashboard 
  cameras={cameraData}
              alerts={alerts}
              activeAlerts={activeAlerts}
              resolveAlert={resolveAlert}
            />
          )}

          {activePage === "Live Monitoring" && (
            <Monitoring cameras={cameraData} />
          )}

          {activePage === "Cameras" && <CameraPage cameras={cameraData} />}

          {activePage === "Detections" && <DetectionPage />}

          {activePage === "Alert Center" && (
            <AlertPage alerts={alerts} resolveAlert={resolveAlert} />
          )}

          {activePage === "Analytics" && <AnalyticsPage />}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ cameras, alerts, activeAlerts, resolveAlert }) {
  return (
    <>
      <section className="hero">
        <div>
          <div className="hero-tag">
            <span></span> AI SURVEILLANCE ACTIVE
          </div>
          <h3>Border Security Overview</h3>
          <p>
            Real-time intelligence from your connected surveillance network.
          </p>
        </div>

        <div className="hero-right">
          <div className="secure-badge">
            <CheckCircle2 size={18} />
            PERIMETER SECURE
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          icon={<Camera />}
          label="TOTAL CAMERAS"
          value="12"
          detail="+2 this month"
        />
        <StatCard
          icon={<Signal />}
          label="ONLINE CAMERAS"
          value="10"
          detail="83.3% availability"
          good
        />
        <StatCard
          icon={<ShieldAlert />}
          label="ACTIVE ALERTS"
          value={activeAlerts.toString().padStart(2, "0")}
          detail="Requires attention"
          danger
        />
        <StatCard
          icon={<Users />}
          label="DETECTIONS TODAY"
          value="328"
          detail="+18.4% vs yesterday"
        />
      </section>

      <section className="main-grid">
        <div className="panel camera-panel">
          <PanelHeader
            title="LIVE CAMERA FEED"
            subtitle="Real-time perimeter monitoring"
            icon={<Monitor />}
            action="VIEW ALL"
          />

          <div className="camera-grid">
            {cameras.slice(0, 4).map((camera) => (
              <CameraCard key={camera.id} camera={camera} />
            ))}
          </div>
        </div>

        <div className="panel alert-panel">
          <PanelHeader
            title="THREAT DETECTION"
            subtitle="Priority security events"
            icon={<ShieldAlert />}
            action="ALL ALERTS"
          />

          <div className="alerts-list">
            {alerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onResolve={resolveAlert}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel chart-panel">
          <PanelHeader
            title="DETECTION ACTIVITY"
            subtitle="24-hour AI detection trend"
            icon={<Activity />}
            action="LIVE DATA"
          />

          <div className="chart">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={detectionData}>
                <defs>
                  <linearGradient id="detectionFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#202938" />

                <XAxis
                  dataKey="time"
                  stroke="#667085"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#667085"
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid #263244",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#detectionFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel system-panel">
          <PanelHeader
            title="SYSTEM HEALTH"
            subtitle="Infrastructure status"
            icon={<Zap />}
          />

          <HealthRow label="AI Detection Engine" value="ONLINE" />
          <HealthRow label="Tracking Service" value="ONLINE" />
          <HealthRow label="API Gateway" value="ONLINE" />
          <HealthRow label="Database" value="ONLINE" />

          <div className="health-footer">
            <span>System uptime</span>
            <strong>99.98%</strong>
          </div>
        </div>
      </section>
    </>
  );
}

function StatCard({ icon, label, value, detail, good, danger }) {
  return (
    <div className={`stat-card ${danger ? "danger" : ""}`}>
      <div className="stat-top">
        <div className="stat-icon">{icon}</div>
        <span className={good ? "positive" : danger ? "negative" : ""}>
          {good ? "● LIVE" : danger ? "● ACTION" : "● TODAY"}
        </span>
      </div>

      <p>{label}</p>
      <h4>{value}</h4>
      <small>{detail}</small>
    </div>
  );
}

function PanelHeader({ title, subtitle, icon, action }) {
  return (
    <div className="panel-header">
      <div className="panel-title">
        <div className="panel-icon">{icon}</div>
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>

      {action && <button className="panel-action">{action}</button>}
    </div>
  );
}

function CameraCard({ camera }) {
  return (
    <div className={`camera-card ${camera.status === "offline" ? "offline" : ""}`}>
      <div className="camera-video">
        {camera.status === "online" ? (
          <>
            <div className="scan-line"></div>
            <div className="fake-scene">
              <div className="grid-overlay"></div>
              <div className="person person-one"></div>
              <div className="person person-two"></div>
              <div className="detection-box box-one">
                <span>PERSON 94%</span>
              </div>
            </div>

            <div className="camera-live">
              <span></span> LIVE
            </div>
          </>
        ) : (
          <div className="offline-screen">
            <Camera size={28} />
            <span>CAMERA OFFLINE</span>
          </div>
        )}

        <div className="camera-id">CAM-{String(camera.id).padStart(2, "0")}</div>
      </div>

      <div className="camera-info">
        <div>
          <strong>{camera.name}</strong>
          <small>{camera.location}</small>
        </div>

        <div className="camera-meta">
          <span>
            <Users size={13} /> {camera.people}
          </span>
          <span
            className={camera.status === "online" ? "online-text" : "offline-text"}
          >
            ● {camera.status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ alert, onResolve }) {
  return (
    <div className={`alert-item ${alert.active ? "" : "resolved"}`}>
      <div className={`severity-dot ${alert.severity.toLowerCase()}`}></div>

      <div className="alert-content">
        <div className="alert-title-row">
          <strong>{alert.type}</strong>
          <span>{alert.time}</span>
        </div>

        <p>{alert.message}</p>

        <small>
          <Camera size={12} /> {alert.camera}
        </small>
      </div>

      {alert.active ? (
        <button
          className="resolve-btn"
          onClick={() => onResolve(alert.id)}
          title="Resolve alert"
        >
          ✓
        </button>
      ) : (
        <CheckCircle2 className="resolved-icon" size={19} />
      )}
    </div>
  );
}

function HealthRow({ label, value }) {
  return (
    <div className="health-row">
      <div>
        <span className="health-dot"></span>
        {label}
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function Monitoring({ cameras }) {
  return (
    <div>
      <section className="page-intro">
        <span className="eyebrow">REAL-TIME VIDEO</span>
        <h3>Live Monitoring</h3>
        <p>Monitor all connected surveillance feeds from one command center.</p>
      </section>

      <div className="monitor-grid">
        {cameras.map((camera) => (
          <CameraCard key={camera.id} camera={camera} />
        ))}
      </div>
    </div>
  );
}

function CameraPage({ cameras }) {
  return (
    <div>
      <section className="page-intro">
        <span className="eyebrow">NETWORK INVENTORY</span>
        <h3>Camera Network</h3>
        <p>Connected surveillance infrastructure and camera health.</p>
      </section>

      <div className="camera-table panel">
        <div className="table-header">
          <span>CAMERA</span>
          <span>LOCATION</span>
          <span>STATUS</span>
          <span>DETECTIONS</span>
          <span>SIGNAL</span>
        </div>

        {cameras.map((camera) => (
          <div className="table-row" key={camera.id}>
            <strong>
              <Camera size={17} /> {camera.name}
            </strong>
            <span>{camera.location}</span>
            <span className={camera.status === "online" ? "online-text" : "offline-text"}>
              ● {camera.status.toUpperCase()}
            </span>
            <span>{camera.people} people</span>
            <span>{camera.signal ? `${camera.signal}%` : "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function DetectionPage() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);

  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedVideo(file);
    setUploading(true);
    setDetectionResult(null);

    try {
      console.log("Selected video:", file.name);

      // Temporary result.
      // We will connect this to your backend AI API next.
      setDetectionResult({
        detection: {
          detections: [],
          total_detections: 0,
          frames_analyzed: 0,
        },
      });
    } catch (error) {
      console.error("Video upload error:", error);

      setDetectionResult({
        error: "Unable to process video.",
      });
    } finally {
      setUploading(false);
    }
  };

  // REAL AI DETECTION DATA
  const rawDetections =
    detectionResult?.detection?.detections || [];

  const totalDetections =
    detectionResult?.detection?.total_detections ||
    rawDetections.length;

  const objectStats = rawDetections.reduce(
    (acc, detection) => {
      const objectName =
        detection.class_name ||
        detection.label ||
        detection.object ||
        "Unknown";

      acc[objectName] =
        (acc[objectName] || 0) + 1;

      return acc;
    },
    {}
  );

  const objectStatsList = Object.entries(
    objectStats
  ).map(([name, count]) => ({
    name,
    count,
  }));

  const detectionTimeline =
    rawDetections.reduce(
      (acc, detection) => {
        const frame =
          detection.frame ||
          detection.frame_number ||
          0;

        acc[frame] =
          (acc[frame] || 0) + 1;

        return acc;
      },
      {}
    );

  const timelineData = Object.entries(
    detectionTimeline
  )
    .map(([frame, count]) => ({
      frame: Number(frame),
      detections: count,
    }))
    .sort((a, b) => a.frame - b.frame);

  const framesAnalyzed =
    detectionResult?.detection?.frames_analyzed || 0;

  return (
    <div className="page-container">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>AI Detection</h1>
          <p>
            Upload video footage and analyze
            detected objects using AI.
          </p>
        </div>
      </div>

      {/* VIDEO UPLOAD */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Video Detection</h2>
            <p>
              Upload a surveillance video for
              AI-powered detection.
            </p>
          </div>
        </div>

        <div className="upload-area">

          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            hidden
            id="video-upload"
          />

          <label
            htmlFor="video-upload"
            className="upload-button"
          >
            <Camera size={20} />

            {uploading
              ? "Processing..."
              : "Choose Video"}
          </label>

          {selectedVideo && (
            <div className="selected-file">
              <CheckCircle2 size={18} />
              <span>
                {selectedVideo.name}
              </span>
            </div>
          )}

        </div>
      </div>

      {/* DETECTION RESULT */}
      {detectionResult && (
        <div className="panel">

          <div className="panel-header">
            <div>
              <h2>AI Detection Report</h2>
              <p>
                Results generated from the
                uploaded video.
              </p>
            </div>
          </div>

          {/* ERROR */}
          {detectionResult.error ? (

            <div className="alert-error">
              <AlertTriangle size={20} />
              <span>
                {detectionResult.error}
              </span>
            </div>

          ) : (

            <>

              {/* METRICS */}
              <div className="stats-grid">

                <StatCard
                  label="TOTAL DETECTIONS"
                  value={totalDetections}
                  detail="AI detections"
                  icon={
                    <Activity size={22} />
                  }
                />

                <StatCard
                  label="FRAMES ANALYZED"
                  value={framesAnalyzed}
                  detail="Video frames"
                  icon={
                    <Camera size={22} />
                  }
                />

                <StatCard
                  label="OBJECTS DETECTED"
                  value={
                    objectStatsList.length
                  }
                  detail="Unique objects"
                  icon={
                    <Users size={22} />
                  }
                />

              </div>

              {/* OBJECT STATISTICS */}
              {objectStatsList.length > 0 && (

                <div className="panel-section">

                  <h3>
                    Detected Objects
                  </h3>

                  <div className="detection-stats">

                    {objectStatsList.map(
                      (item) => (

                        <div
                          className="detection-stat"
                          key={item.name}
                        >

                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            {item.count}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

              {/* TIMELINE */}
              {timelineData.length > 0 && (

                <div className="panel-section">

                  <h3>
                    Detection Timeline
                  </h3>

                  <div
                    style={{
                      width: "100%",
                      height: 300,
                    }}
                  >

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <LineChart
                        data={timelineData}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis
                          dataKey="frame"
                        />

                        <YAxis />

                        <Tooltip />

                        <Line
                          type="monotone"
                          dataKey="detections"
                          strokeWidth={2}
                        />

                      </LineChart>

                    </ResponsiveContainer>

                  </div>

                </div>

              )}

              {/* DETECTION TABLE */}
              {rawDetections.length > 0 && (

                <div className="panel-section">

                  <h3>
                    Detection Details
                  </h3>

                  <div className="table-container">

                    <table>

                      <thead>
                        <tr>
                          <th>Object</th>
                          <th>Confidence</th>
                          <th>Frame</th>
                        </tr>
                      </thead>

                      <tbody>

                        {rawDetections.map(
                          (detection, index) => (

                            <tr key={index}>

                              <td>
                                {detection.class_name ||
                                  detection.label ||
                                  detection.object ||
                                  "Unknown"}
                              </td>

                              <td>
                                {detection.confidence
                                  ? `${(
                                      detection.confidence *
                                      100
                                    ).toFixed(1)}%`
                                  : "N/A"}
                              </td>

                              <td>
                                {detection.frame ||
                                  detection.frame_number ||
                                  "N/A"}
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

              )}

            </>

          )}

        </div>
      )}

      {/* CURRENT DEMO SUMMARY */}
      <div className="panel">

        <div className="panel-header">
          <div>
            <h2>
              Current Demo Summary
            </h2>

            <p>
              Sample surveillance statistics.
            </p>
          </div>
        </div>

        <div className="stats-grid">

          <StatCard
            label="PEOPLE DETECTED"
            value="286"
            detail="Today"
            icon={
              <Users size={22} />
            }
          />

          <StatCard
            label="OBJECTS DETECTED"
            value="214"
            detail="Today"
            icon={
              <Activity size={22} />
            }
          />

          <StatCard
            label="ALERTS GENERATED"
            value="18"
            detail="Today"
            icon={
              <AlertTriangle size={22} />
            }
          />

        </div>

      </div>

      {/* RECENT AI DETECTIONS */}
      <div className="panel">

        <div className="panel-header">
          <div>
            <h2>
              Recent AI Detections
            </h2>

            <p>
              Latest detection activity.
            </p>
          </div>
        </div>

        <div className="detections-list">

          {[101, 100, 99, 98, 97].map(
            (id, index) => (

              <div
                className="detection-row"
                key={id}
              >

                <div className="detection-avatar">
                  <Users size={18} />
                </div>

                <div>
                  <strong>
                    PERSON DETECTED
                  </strong>

                  <small>
                    Track ID #{25 - index}
                    {" • "}
                    Camera {index + 1}
                  </small>
                </div>

                <span className="confidence">
                  {94 - index * 3}%
                  {" confidence"}
                </span>

                <span>
                  19:{21 - index}:15
                </span>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}
export default App;

