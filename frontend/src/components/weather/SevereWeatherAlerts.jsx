function SevereWeatherAlerts({
    data,
    language = "hi",
  }) {
    if (!data) return null;
  
    const formatAlertTime = (time) => {
      if (!time) return "";
  
      return new Date(time).toLocaleString(
        language === "hi" ? "hi-IN" : "en-IN",
        {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
        }
      );
    };
  
    const getLevelInfo = (level) => {
      switch (level) {
        case "high":
          return {
            icon: "🔴",
            label:
              language === "hi"
                ? "उच्च जोखिम"
                : "High Risk",
          };
  
        case "medium":
          return {
            icon: "🟠",
            label:
              language === "hi"
                ? "मध्यम जोखिम"
                : "Medium Risk",
          };
  
        case "low":
          return {
            icon: "🟡",
            label:
              language === "hi"
                ? "कम जोखिम"
                : "Low Risk",
          };
  
        default:
          return {
            icon: "🟢",
            label:
              language === "hi"
                ? "सामान्य"
                : "Normal",
          };
      }
    };
  
    const overall =
      getLevelInfo(data.overallLevel);
  
    return (
      <section className="weather-section severe-weather-section">
  
        {/* HEADER */}
  
        <div className="weather-section-heading">
          <div>
            <span className="weather-label">
              ⚠️ KRISHIMITRA FARM ALERTS
            </span>
  
            <h2>
              {language === "hi"
                ? "गंभीर मौसम चेतावनी"
                : "Severe Weather Intelligence"}
            </h2>
  
            <p className="crop-weather-description">
              {data.summary}
            </p>
          </div>
  
          <div
            className={`severe-overall-level severe-${data.overallLevel}`}
          >
            {overall.icon} {overall.label}
          </div>
        </div>
  
        {/* SUMMARY */}
  
        <div className="severe-summary-grid">
  
          <div className="severe-summary-card">
            <span>⚠️</span>
  
            <div>
              <small>
                {language === "hi"
                  ? "कुल चेतावनी"
                  : "TOTAL ALERTS"}
              </small>
  
              <strong>
                {data.alertCount}
              </strong>
            </div>
          </div>
  
          <div className="severe-summary-card">
            <span>🔴</span>
  
            <div>
              <small>
                {language === "hi"
                  ? "उच्च प्राथमिकता"
                  : "HIGH PRIORITY"}
              </small>
  
              <strong>
                {data.highPriorityCount}
              </strong>
            </div>
          </div>
  
          <div className="severe-summary-card">
            <span>🌾</span>
  
            <div>
              <small>
                {language === "hi"
                  ? "फसल"
                  : "CROP"}
              </small>
  
              <strong>
                {data.cropName || "—"}
              </strong>
            </div>
          </div>
  
          <div className="severe-summary-card">
            <span>📅</span>
  
            <div>
              <small>
                {language === "hi"
                  ? "विश्लेषण अवधि"
                  : "FORECAST PERIOD"}
              </small>
  
              <strong>
                {data.periodHours}h
              </strong>
            </div>
          </div>
  
        </div>
  
        {/* ALERTS */}
  
        {data.alerts.length > 0 ? (
          <div className="severe-alert-list">
  
            {data.alerts.map((alert) => {
              const severity =
                getLevelInfo(alert.severity);
  
              return (
                <div
                  key={alert.id}
                  className={`severe-alert-card severe-alert-${alert.severity}`}
                >
  
                  <div className="severe-alert-icon">
                    {alert.icon}
                  </div>
  
                  <div className="severe-alert-content">
  
                    <div className="severe-alert-header">
  
                      <div>
                        <span className="weather-label">
                          {alert.type}
                        </span>
  
                        <h3>
                          {alert.title}
                        </h3>
                      </div>
  
                      <span
                        className={`severe-alert-badge severe-${alert.severity}`}
                      >
                        {severity.icon}{" "}
                        {severity.label}
                      </span>
  
                    </div>
  
                    {alert.time && (
                      <div className="severe-alert-time">
                        🕐{" "}
                        {formatAlertTime(
                          alert.time
                        )}
                      </div>
                    )}
  
                    <p>
                      {alert.message}
                    </p>
  
                    <div className="severe-alert-action">
  
                      <span>🛡️</span>
  
                      <div>
                        <strong>
                          {language === "hi"
                            ? "सुझाई गई कार्रवाई"
                            : "Recommended Action"}
                        </strong>
  
                        <p>
                          {alert.action}
                        </p>
                      </div>
  
                    </div>
  
                  </div>
  
                </div>
              );
            })}
  
          </div>
        ) : (
          <div className="severe-weather-safe">
  
            <span>✅</span>
  
            <div>
              <strong>
                {language === "hi"
                  ? "कोई प्रमुख मौसम चेतावनी नहीं"
                  : "No Major Weather Alerts"}
              </strong>
  
              <p>
                {language === "hi"
                  ? "अगले 72 घंटों के forecast में कोई प्रमुख severe-weather condition नहीं मिली।"
                  : "No major severe-weather condition was identified in the next 72-hour forecast."}
              </p>
            </div>
  
          </div>
        )}
  
        <div className="weather-disclaimer">
          ℹ️{" "}
          {language === "hi"
            ? "ये alerts forecast-based decision support हैं। स्थानीय सरकारी मौसम चेतावनी और कृषि विभाग की advisory को प्राथमिकता दें।"
            : "These alerts are forecast-based decision support. Follow official local weather warnings and agricultural advisories when available."}
        </div>
  
      </section>
    );
  }
  
  export default SevereWeatherAlerts;