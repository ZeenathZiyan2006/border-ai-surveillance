function getAlertSummary(alerts) {
    return {
        total: alerts.length,
        newAlerts: alerts.filter(a => a.status === "NEW").length,
        highSeverity: alerts.filter(a => a.severity === "HIGH").length
    };
}

module.exports = {
    getAlertSummary
};