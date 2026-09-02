// Alert System - Member 6

function createAlert(type, cameraId, severity, message) {
    return {
        id: Date.now(),
        type: type,
        cameraId: cameraId,
        severity: severity,
        message: message,
        timestamp: new Date().toISOString(),
        status: "NEW"
    };
}

module.exports = {
    createAlert
};