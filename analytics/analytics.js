function getAlertSummary(alerts) {
    return {
        total: alerts.length,
        newAlerts: alerts.filter(a => a.status === "NEW").length,
        highSeverity: alerts.filter(a => a.severity === "HIGH").length,
        mediumSeverity: alerts.filter(a => a.severity === "MEDIUM").length,
        lowSeverity: alerts.filter(a => a.severity === "LOW").length
    };
}

module.exports={
    getAlertSummary
};
