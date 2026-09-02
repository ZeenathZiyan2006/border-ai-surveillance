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
const [selectedImage, setSelectedImage] = useState(null);
const [imageScanning, setImageScanning] = useState(false);
const [imageAlertResult, setImageAlertResult] = useState(null);
  
      setDetectionResult({
        error: "Unable to process video.",
      });
    } finally {
      setUploading(false);
    }
  };

  // ================================
  // REAL AI DETECTION DATA
  // ================================
+++++++++++++++++++++
  const rawDetections =
    detectionResult?.detection?.detections || [];

  const totalDetections =
    detectionResult?.detection?.total_detections ||
    rawDetections.length;

  // Count each detected object
  const objectStats = rawDetections.reduce(
    (acc, detection) => {
      const object = detection.object || "unknown";

      if (!acc[object]) {
        acc[object] = {
          count: 0,
          maxConfidence: 0,
        };
      }

      acc[object].count += 1;

      acc[object].maxConfidence = Math.max(
        acc[object].maxConfidence,
        Number(detection.confidence || 0)
      );

      return acc;
    },
    {}
  );

  const objectStatsList = Object.entries(objectStats)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([object, stats]) => ({
      object,
      count: stats.count,
      maxConfidence: Math.round(
        stats.maxConfidence * 100
      ),
    }));

  // Detection activity by frame
  const detectionTimeline = rawDetections.reduce(
    (acc, detection) => {
      const frame = detection.frame || 0;

      if (!acc[frame]) {
        acc[frame] = 0;
      }

      acc[frame] += 1;

      return acc;
    },
    {}
  );

  const timelineData = Object.entries(detectionTimeline)
    .map(([frame, count]) => ({
      frame: Number(frame),
      count,
    }))
    .sort((a, b) => a.frame - b.frame);

  const framesAnalyzed = rawDetections.length
    ? Math.max(
        ...rawDetections.map((d) => d.frame || 0)
      )
    : 0;

  return (
    <div>

      {/* PAGE HEADER */}

      <section className="page-intro">
        <span className="eyebrow">
          AI COMPUTER VISION
        </span>

        <h3>Detection History</h3>

        <p>
          Analyze surveillance footage using the
          AI vision engine.
        </p>
      </section>


      {/* VIDEO UPLOAD */}

      <div className="panel video-upload-panel">

        <PanelHeader
          title="AI VIDEO ANALYSIS"
          subtitle="Upload surveillance footage for AI processing"
          icon={<Video />}
        />

        <label className="video-upload-box">

          <Video size={30} />

          <strong>
            {uploading
              ? "ANALYZING VIDEO..."
              : selectedVideo
              ? selectedVideo.name
              : "UPLOAD SURVEILLANCE VIDEO"}
          </strong>

          <small>
            {uploading
              ? "AI detection engine is processing the footage"
              : "Click to select a video file"}
          </small>

          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            hidden
          />

        </label>


        {/* AI RESULT */}

        {detectionResult && (
          <div className="detection-result">

            {detectionResult.error ? (

              <div>
                <strong>
                  AI ANALYSIS FAILED
                </strong>

                <p>
                  {detectionResult.error}
                </p>
              </div>

            ) : (

              <>

                {/* REPORT HEADER */}

                <div className="result-header">

                  <div>
                    <span className="eyebrow">
                      AI ANALYSIS COMPLETE
                    </span>

                    <h4>
                      Video Intelligence Report
                    </h4>
                  </div>

                  <span className="result-status">
                    <CheckCircle2 size={16} />
                    PROCESSED
                  </span>

                </div>


                {/* MAIN METRICS */}

                <div className="result-metrics">

                  <div className="result-metric">
                    <Target size={20} />

                    <span>
                      TOTAL DETECTIONS
                    </span>

                    <strong>
                      {totalDetections}
                    </strong>
                  </div>


                  <div className="result-metric">
                    <Eye size={20} />

                    <span>
                      OBJECT CLASSES
                    </span>

                    <strong>
                      {objectStatsList.length}
                    </strong>
                  </div>


                  <div className="result-metric">
                    <Video size={20} />

                    <span>
                      FRAMES ANALYZED
                    </span>

                    <strong>
                      {framesAnalyzed}
                    </strong>
                  </div>

                </div>


                {/* OBJECT TABLE */}

                <div className="object-table">

                  <div className="object-row object-head">

                    <span>
                      OBJECT
                    </span>

                    <span>
                      DETECTIONS
                    </span>

                    <span>
                      MAX CONFIDENCE
                    </span>

                  </div>


                  {objectStatsList.map(
                    ({
                      object,
                      count,
                      maxConfidence,
                    }) => (

                      <div
                        className="object-row"
                        key={object}
                      >

                        <strong>
                          {object.toUpperCase()}
                        </strong>

                        <span>
                          {count}
                        </span>

                        <span>
                          {maxConfidence}%
                        </span>

                      </div>

                    )
                  )}

                </div>


                {/* DETECTION ACTIVITY CHART */}

                <div className="detection-chart">

                  <div className="chart-heading">

                    <div>

                      <span className="eyebrow">
                        FRAME ANALYSIS
                      </span>

                      <h4>
                        Detection Activity
                      </h4>

                    </div>

                    <span className="chart-info">
                      {timelineData.length} frames with detections
                    </span>

                  </div>


                  <div className="chart-container">

                    <ResponsiveContainer
                      width="100%"
                      height={260}
                    >

                      <AreaChart
                        data={timelineData}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          opacity={0.15}
                        />

                        <XAxis
                          dataKey="frame"
                          tick={{ fontSize: 10 }}
                          tickLine={false}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 10 }}
                          tickLine={false}
                        />

                        <Tooltip />

                        <Area
                          type="monotone"
                          dataKey="count"
                          strokeWidth={2}
                          fillOpacity={0.15}
                        />

                      </AreaChart>

                    </ResponsiveContainer>

                  </div>

                </div>

              </>

            )}

          </div>
        )}

      </div>


      {/* CURRENT DEMO SUMMARY */}

      <div className="detection-summary">

        <div className="mini-stat">
          <Target />

          <span>
            PERSON
          </span>

          <strong>
            286
          </strong>
        </div>


        <div className="mini-stat">
          <Eye />

          <span>
            TRACKED
          </span>

          <strong>
            214
          </strong>
        </div>


        <div className="mini-stat">
          <ShieldAlert />

          <span>
            FLAGGED
          </span>

          <strong>
            18
          </strong>
        </div>

      </div>


      {/* RECENT DETECTIONS */}

      <div className="panel detection-list">

        <PanelHeader
          title="RECENT AI DETECTIONS"
          subtitle="Latest events received from the vision engine"
          icon={<Target />}
        />


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
                  Track ID #{25 - index} • Camera {index + 1}
                </small>

              </div>

              <span className="confidence">
                {94 - index * 3}% confidence
              </span>

              <span>
                19:{21 - index}:15
              </span>

          )
        )}

      </div>

    </div>
  );
}

function AlertPage({ alerts, resolveAlert }) {
  return (
    <div>
      <section className="page-intro">
        <span className="eyebrow">THREAT MANAGEMENT</span>
        <h3>Alert Center</h3>
        <p>Review, investigate and acknowledge security events.</p>
      </section>

      <div className="alert-page-grid">
        <div className="alert-summary-card">
          <ShieldAlert size={28} />
          <span>ACTIVE THREATS</span>
          <strong>{alerts.filter((a) => a.active).length}</strong>
          <small>Events requiring attention</small>
        </div>

        <div className="alert-summary-card">
          <CheckCircle2 size={28} />
          <span>RESOLVED</span>
          <strong>{alerts.filter((a) => !a.active).length}</strong>
          <small>Handled security events</small>
        </div>
      </div>

      <div className="panel full-alert-list">
        <PanelHeader
          title="SECURITY EVENTS"
          subtitle="Most recent alerts"
          icon={<Bell />}
        />

        {alerts.map((alert) => (
          <AlertItem
            key={alert.id}
            alert={alert}
            onResolve={resolveAlert}
          />
        ))}
      </div>
    </div>
  );
}

function AnalyticsPage() {
  return (
    <div>
      <section className="page-intro">
        <span className="eyebrow">INTELLIGENCE & INSIGHTS</span>
        <h3>Security Analytics</h3>
        <p>Analyze surveillance activity and AI detection patterns.</p>
      </section>

      <div className="analytics-large panel">
        <PanelHeader
          title="DETECTION VOLUME"
          subtitle="AI detections across the surveillance network"
          icon={<Activity />}
        />

        <div className="big-chart">
          <ResponsiveContainer width="100%" height={390}>
            <AreaChart data={detectionData}>
              <defs>
                <linearGradient id="bigFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#202938" />

              <XAxis dataKey="time" stroke="#667085" />
              <YAxis stroke="#667085" />

              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #263244",
                  borderRadius: "10px",
                }}
              />

              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#bigFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default App;